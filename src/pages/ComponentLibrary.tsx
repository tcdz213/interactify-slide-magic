
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card/index';
import { Separator } from '@/components/ui/separator';

const ComponentLibrary = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Component Library</h1>
        <p className="text-muted-foreground mb-8">
          This page showcases the reusable components available in the project.
        </p>
        
        <Separator className="my-8" />
        
        {/* Buttons section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
          </div>
          
          <h3 className="text-xl font-medium mt-6 mb-4">Sizes</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <span className="sr-only">Icon button</span>
              +
            </Button>
          </div>
        </section>
        
        <Separator className="my-8" />
        
        {/* Cards section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Main card content with details about the item</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
            
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>No Hover Effect</CardTitle>
                <CardDescription>This card doesn't have hover effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content without hover animation</p>
              </CardContent>
            </Card>
            
            <Card variant="borderless" className="bg-primary/5">
              <CardHeader>
                <CardTitle>Borderless Card</CardTitle>
                <CardDescription>No border or shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Simplified card for subtle UI elements</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComponentLibrary;
