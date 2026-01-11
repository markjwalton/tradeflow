"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"

// Utility function
const clamp = (min, max, value) => Math.min(Math.max(value, min), max)

// Simplified Carousel implementation based on Motion+ private repo
// Source: github.com/motiondivision/plus/packages/motion-plus/src/components/Carousel

const defaultTransition = {
  type: "spring",
  stiffness: 200,
  damping: 40,
}

const limitSpring = {
  type: "spring",
  stiffness: 80,
  damping: 10,
}

export function Carousel({
  items = [],
  loop = true,
  transition = defaultTransition,
  axis = "x",
  snap = "page",
  page,
  gap = 20,
  className = "",
  style = {},
  children,
}) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState(0)
  const [itemSizes, setItemSizes] = useState([])
  const [currentPage, setCurrentPage] = useState(page || 0)
  const [totalPages, setTotalPages] = useState(1)
  
  const targetOffset = useMotionValue(0)
  const offset = useMotionValue(0)
  const tugOffset = useMotionValue(0)
  const renderedOffset = useTransform(() => tugOffset.get() + offset.get())

  // Measure container and items
  useEffect(() => {
    if (!containerRef.current) return

    const updateMeasurements = () => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const size = axis === "x" ? containerRect.width : containerRect.height
      setContainerSize(size)

      // Measure all items
      const itemElements = Array.from(container.querySelectorAll('[data-carousel-item]'))
      const sizes = itemElements.map(el => {
        const rect = el.getBoundingClientRect()
        return axis === "x" ? rect.width : rect.height
      })
      setItemSizes(sizes)

      // Calculate pages
      if (size > 0 && sizes.length > 0) {
        const pages = Math.max(1, sizes.length)
        setTotalPages(pages)
      }
    }

    updateMeasurements()

    const resizeObserver = new ResizeObserver(updateMeasurements)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [axis, items.length])

  // Handle page navigation
  const nextPage = () => {
    if (loop || currentPage < totalPages - 1) {
      const newPage = loop ? (currentPage + 1) % totalPages : Math.min(currentPage + 1, totalPages - 1)
      setCurrentPage(newPage)
      animateToPage(newPage)
    }
  }

  const prevPage = () => {
    if (loop || currentPage > 0) {
      const newPage = loop ? (currentPage - 1 + totalPages) % totalPages : Math.max(currentPage - 1, 0)
      setCurrentPage(newPage)
      animateToPage(newPage)
    }
  }

  const gotoPage = (pageIndex) => {
    const clampedPage = clamp(0, totalPages - 1, pageIndex)
    setCurrentPage(clampedPage)
    animateToPage(clampedPage)
  }

  const animateToPage = (pageIndex) => {
    if (itemSizes.length === 0 || containerSize === 0) return

    // Calculate offset for this page
    let pageOffset = 0
    for (let i = 0; i < pageIndex && i < itemSizes.length; i++) {
      pageOffset += itemSizes[i] + gap
    }

    targetOffset.set(-pageOffset)
    offset.set(-pageOffset)
  }

  // Initialize page offset
  useEffect(() => {
    if (page !== undefined && itemSizes.length > 0) {
      animateToPage(page)
    }
  }, [page, itemSizes])

  const isNextActive = loop || currentPage < totalPages - 1
  const isPrevActive = loop || currentPage > 0

  const carouselContext = {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    isNextActive,
    isPrevActive,
    gotoPage,
    targetOffset,
  }

  const transformStyle = axis === "x" 
    ? { x: renderedOffset }
    : { y: renderedOffset }

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
          ...transformStyle,
        }}
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

// Context for carousel controls
import { createContext, useContext } from "react"

const CarouselContext = createContext(null)

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel component")
  }
  return context
}