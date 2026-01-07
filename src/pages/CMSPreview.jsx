import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, RefreshCw } from 'lucide-react';
import { BentoCard } from '@/components/radiant/BentoCard';
import { Container } from '@/components/radiant/Container';
import { Footer } from '@/components/radiant/Footer';
import { Gradient } from '@/components/radiant/Gradient';
import { Navbar } from '@/components/radiant/Navbar';
import { Heading, Subheading } from '@/components/radiant/Text';

export default function CMSPreview() {
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('RadiantHome');
  const [renderData, setRenderData] = useState(null);
  const [isRendering, setIsRendering] = useState(false);

  const { data: websites = [], isLoading: loadingWebsites } = useQuery({
    queryKey: ['websites'],
    queryFn: () => base44.entities.WebsiteFolder.list(),
  });

  const handleRender = async () => {
    if (!selectedWebsite) return;
    
    setIsRendering(true);
    try {
      const response = await base44.functions.invoke('renderCMSWithFramework', {
        websiteFolderId: selectedWebsite,
        frameworkPage: selectedFramework
      });
      
      setRenderData(response.data);
    } catch (error) {
      console.error('Render error:', error);
    } finally {
      setIsRendering(false);
    }
  };

  const renderHero = (hero) => {
    if (!hero) return null;
    return (
      <div className="relative">
        <Gradient className="absolute inset-2 bottom-0 rounded-[2rem] ring-1 ring-black/5 ring-inset" />
        <Container className="relative">
          <Navbar />
          <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
            <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
              {hero.title}
            </h1>
            <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
              {hero.description}
            </p>
            {hero.cta && (
              <div className="mt-12">
                <Button href="#">{hero.cta}</Button>
              </div>
            )}
          </div>
        </Container>
      </div>
    );
  };

  const renderBentoSection = (cards) => {
    if (!cards || cards.length === 0) return null;
    return (
      <Container className="py-24">
        <Subheading>Features</Subheading>
        <Heading as="h3" className="mt-2 max-w-3xl">
          Powered by your content
        </Heading>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {cards.slice(0, 6).map((card, idx) => (
            <BentoCard
              key={idx}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              className={
                idx === 0 ? "max-lg:rounded-t-[2rem] lg:col-span-3 lg:rounded-tl-[2rem]" :
                idx === 1 ? "lg:col-span-3 lg:rounded-tr-[2rem]" :
                idx === 2 ? "lg:col-span-2 lg:rounded-bl-[2rem]" :
                idx === 5 ? "max-lg:rounded-b-[2rem] lg:col-span-2 lg:rounded-br-[2rem]" :
                "lg:col-span-2"
              }
            />
          ))}
        </div>
      </Container>
    );
  };

  const renderBlogSection = (posts) => {
    if (!posts || posts.length === 0) return null;
    return (
      <Container className="py-24">
        <Heading as="h2">Latest Updates</Heading>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    );
  };

  const renderProductSection = (products) => {
    if (!products || products.length === 0) return null;
    return (
      <Container className="py-24">
        <Heading as="h2">Products</Heading>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                {product.price && (
                  <p className="text-2xl font-bold text-primary-600">
                    £{product.price.toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Controls */}
      <div className="bg-white border-b sticky top-0 z-50">
        <Container className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={selectedWebsite || ''} onValueChange={setSelectedWebsite}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select website..." />
              </SelectTrigger>
              <SelectContent>
                {websites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select framework..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RadiantHome">Radiant</SelectItem>
                <SelectItem value="StudioHome">Studio</SelectItem>
                <SelectItem value="SyntaxHome">Syntax</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleRender}
              disabled={!selectedWebsite || isRendering}
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>

            {renderData && (
              <Button variant="outline" onClick={handleRender}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* Preview */}
      {renderData ? (
        <div className="overflow-hidden bg-white">
          {renderHero(renderData.renderData?.hero)}
          <main>
            <div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
              {renderBentoSection(renderData.renderData?.bentoCards)}
            </div>
            {renderBlogSection(renderData.renderData?.blogPosts)}
            {renderProductSection(renderData.renderData?.products)}
          </main>
          <Footer />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">Select a website and click Preview</p>
              <p className="text-sm text-gray-500">
                AI will analyze your CMS content and render it using the selected framework
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}