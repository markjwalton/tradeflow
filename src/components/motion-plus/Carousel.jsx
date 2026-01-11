"use client"

import { motion, useMotionValue, useAnimation } from "framer-motion"
import { useEffect, useRef, useState, useCallback } from "react"

const clamp = (min, max, value) => Math.min(Math.max(value, min), max)

const defaultTransition = {
  type: "spring",
  stiffness: 200,
  damping: 40,
}

export function Carousel({
  items = [],
  loop = true,
  transition = defaultTransition,
  axis = "x",
  gap = 20,
  className = "",
  style = {},
  children,
}) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState(0)
  const [itemSizes, setItemSizes] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const x = useMotionValue(0)

  // Measure container and items
  useEffect(() => {
    if (!containerRef.current) return

    const updateMeasurements = () => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const size = axis === "x" ? containerRect.width : containerRect.height
      setContainerSize(size)

      const itemElements = Array.from(container.querySelectorAll('[data-carousel-item]'))
      const sizes = itemElements.map(el => {
        const rect = el.getBoundingClientRect()
        return axis === "x" ? rect.width : rect.height
      })
      setItemSizes(sizes)
    }

    updateMeasurements()
    const resizeObserver = new ResizeObserver(updateMeasurements)
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [axis, items.length])

  // Calculate offset for a given page index
  const getOffsetForPage = useCallback((pageIndex) => {
    let offset = 0
    for (let i = 0; i < pageIndex && i < itemSizes.length; i++) {
      offset += itemSizes[i] + gap
    }
    return offset
  }, [itemSizes, gap])

  const getMaxScroll = useCallback(() => {
    if (itemSizes.length === 0) return 0
    return itemSizes.reduce((sum, size) => sum + size + gap, 0) - gap - containerSize
  }, [itemSizes, gap, containerSize])

  // Animate to a specific page with spring
  const animateToPage = useCallback((pageIndex) => {
    if (itemSizes.length === 0) return
    const offset = getOffsetForPage(pageIndex)
    x.set(-offset)
    setCurrentPage(pageIndex)
  }, [itemSizes, getOffsetForPage, x])

  const nextPage = useCallback(() => {
    const nextIdx = Math.min(currentPage + 1, itemSizes.length - 1)
    animateToPage(nextIdx)
  }, [currentPage, itemSizes.length, animateToPage])

  const prevPage = useCallback(() => {
    const prevIdx = Math.max(currentPage - 1, 0)
    animateToPage(prevIdx)
  }, [currentPage, animateToPage])

  const isNextActive = currentPage < itemSizes.length - 1
  const isPrevActive = currentPage > 0

  const carouselContext = {
    currentPage,
    nextPage,
    prevPage,
    isNextActive,
    isPrevActive,
  }

  const handleDragEnd = (event, info) => {
    const velocity = info.velocity.x
    const currentPos = x.get()
    
    // Snap to nearest page based on velocity
    let targetPage = currentPage
    if (Math.abs(velocity) > 300) {
      targetPage = velocity > 0 
        ? Math.max(0, currentPage - 1) 
        : Math.min(itemSizes.length - 1, currentPage + 1)
    }
    
    animateToPage(targetPage)
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <motion.div
        style={{
          display: "flex",
          flexDirection: axis === "x" ? "row" : "column",
          gap: `${gap}px`,
          x,
        }}
        drag={axis === "x" ? "x" : "y"}
        dragElastic={0.2}
        dragMomentum={true}
        onDragEnd={handleDragEnd}
        transition={transition}
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            data-carousel-item
            style={{
              flexShrink: 0,
            }}
          >
            {item}
          </div>
        ))}
      </motion.div>
      
      <CarouselContext.Provider value={carouselContext}>
        {children}
      </CarouselContext.Provider>
    </div>
  )
}

import { createContext, useContext } from "react"

const CarouselContext = createContext(null)

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel component")
  }
  return context
}