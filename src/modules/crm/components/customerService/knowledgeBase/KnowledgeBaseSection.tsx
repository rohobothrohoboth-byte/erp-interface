import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Eye, ThumbsUp, ThumbsDown, Tag, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { showToast } from '@/shared/layout/layout';
import KnowledgeBaseHeader from '@/modules/crm/components/customerService/knowledgeBase/KnowledgeBaseHeader';
import KnowledgeBaseSearchFilter from '@/modules/crm/components/customerService/knowledgeBase/KnowledgeBaseSearchFilter';
import type { KnowledgeBaseArticle } from '@/modules/crm/types/crm';
// Mock knowledge base articles
const mockArticles: KnowledgeBaseArticle[] = [
  {
    id: '1',
    title: 'How to Reset Your Password',
    content: `# Password Reset Guide

## Step 1: Navigate to Login Page
Go to the login page and click on "Forgot Password" link.

## Step 2: Enter Your Email
Enter the email address associated with your account.

## Step 3: Check Your Email
Look for a password reset email in your inbox (check spam folder too).

## Step 4: Create New Password
Click the link in the email and create a new secure password.

## Tips for Strong Passwords
- Use at least 8 characters
- Include uppercase and lowercase letters
- Add numbers and special characters
- Avoid common words or personal information`,
    category: 'Account Management',
    tags: ['password', 'login', 'security', 'account'],
    views: 1247,
    helpful: 89,
    notHelpful: 12,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    createdBy: 'Support Team',
    isPublished: true
  },
  {
    id: '2',
    title: 'Troubleshooting Login Issues',
    content: `# Login Troubleshooting Guide

## Common Login Problems

### 1. Incorrect Credentials
- Double-check your email and password
- Ensure Caps Lock is off
- Try typing your password in a text editor first

### 2. Account Locked
- Wait 15 minutes before trying again
- Contact support if the issue persists

### 3. Browser Issues
- Clear your browser cache and cookies
- Try using an incognito/private window
- Update your browser to the latest version

### 4. Network Problems
- Check your internet connection
- Try accessing from a different network
- Disable VPN if you're using one

## Still Having Issues?
Contact our support team at support@company.com or use the chat feature.`,
    category: 'Technical Support',
    tags: ['login', 'troubleshooting', 'browser', 'network'],
    views: 892,
    helpful: 67,
    notHelpful: 8,
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-12T11:20:00Z',
    createdBy: 'Tech Support',
    isPublished: true
  },
  {
    id: '3',
    title: 'Understanding Your Billing Cycle',
    content: `# Billing Cycle Information

## How Billing Works
Your billing cycle starts on the day you first subscribe to our service.

## Monthly vs Annual Plans
- **Monthly**: Billed every 30 days from your start date
- **Annual**: Billed once per year with a discount

## Payment Methods
We accept:
- Credit cards (Visa, MasterCard, American Express)
- PayPal
- Bank transfers (for annual plans)

## Viewing Your Invoices
1. Log into your account
2. Go to "Billing" section
3. Click on "Invoice History"

## Questions About Billing?
Contact our billing team at billing@company.com`,
    category: 'Billing',
    tags: ['billing', 'payment', 'invoice', 'subscription'],
    views: 634,
    helpful: 45,
    notHelpful: 3,
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-10T09:30:00Z',
    createdBy: 'Billing Team',
    isPublished: true
  },
  {
    id: '4',
    title: 'Getting Started with CRM Features',
    content: `# CRM Getting Started Guide

## Overview
Our CRM system helps you manage customer relationships effectively.

## Key Features

### 1. Contact Management
- Add and organize customer contacts
- Track interaction history
- Set up custom fields

### 2. Lead Tracking
- Import leads from various sources
- Score and qualify leads
- Convert leads to customers

### 3. Sales Pipeline
- Visualize your sales process
- Track deal progress
- Forecast revenue

### 4. Reporting
- Generate custom reports
- Track key metrics
- Export data

## Quick Start Steps
1. Import your existing contacts
2. Set up your sales pipeline stages
3. Create your first deal
4. Schedule follow-up activities

Need help? Check out our video tutorials or contact support.`,
    category: 'Product Features',
    tags: ['crm', 'getting-started', 'features', 'tutorial'],
    views: 1156,
    helpful: 78,
    notHelpful: 5,
    createdAt: '2024-01-12T13:20:00Z',
    updatedAt: '2024-01-18T10:15:00Z',
    createdBy: 'Product Team',
    isPublished: true
  }
];

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>(mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('views');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    newTag: ''
  });

  // Filter and sort articles
  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory && article.isPublished;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'helpful':
          return b.helpful - a.helpful;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(articles.map(a => a.category)));

  const handleCreateArticle = () => {
    if (!newArticle.title.trim() || !newArticle.content.trim()) {
      showToast.error('Please fill in title and content');
      return;
    }

    const article: KnowledgeBaseArticle = {
      id: Date.now().toString(),
      title: newArticle.title.trim(),
      content: newArticle.content.trim(),
      category: newArticle.category || 'General',
      tags: newArticle.tags,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User',
      isPublished: true
    };

    setArticles([...articles, article]);
    setNewArticle({ title: '', content: '', category: '', tags: [], newTag: '' });
    setIsCreateDialogOpen(false);
    showToast.success('Article created successfully');
  };

  const handleViewArticle = (article: KnowledgeBaseArticle) => {
    // Increment view count
    setArticles(prev => prev.map(a => 
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
    setSelectedArticle(article);
    setIsViewDialogOpen(true);
  };

  const handleVote = (articleId: string, isHelpful: boolean) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { 
            ...article, 
            helpful: isHelpful ? article.helpful + 1 : article.helpful,
            notHelpful: !isHelpful ? article.notHelpful + 1 : article.notHelpful
          }
        : article
    ));
    showToast.success('Thank you for your feedback!');
  };

  const addTag = () => {
    if (newArticle.newTag.trim() && !newArticle.tags.includes(newArticle.newTag.trim())) {
      setNewArticle(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <KnowledgeBaseHeader />

      {/* Search + Filters + Add */}
      <KnowledgeBaseSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        onAddClick={() => setIsCreateDialogOpen(true)}
      />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {article.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {article.content.replace(/[#*]/g, '').substring(0, 150)}...
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{article.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{article.helpful}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{article.createdBy}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewArticle(article)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Read Article
                    </Button>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(article.id, true)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(article.id, false)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Create Article Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newArticle.title}
                onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Article title"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newArticle.category} 
                onValueChange={(value) => setNewArticle(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newArticle.content}
                onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Article content (Markdown supported)"
                rows={10}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newArticle.newTag}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {newArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)}>
                        <Tag className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateArticle} className="bg-red-600 hover:bg-red-700">
                Create Article
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Article Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl">{selectedArticle.title}</DialogTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>By {selectedArticle.createdBy}</span>
                      <span>•</span>
                      <span>{new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{selectedArticle.views} views</span>
                    </div>
                  </div>
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Was this article helpful?
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote(selectedArticle.id, true)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Yes ({selectedArticle.helpful})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote(selectedArticle.id, false)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      No ({selectedArticle.notHelpful})
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}