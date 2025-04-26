import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/hooks/use-user-context";

// Pages
import Home from "@/pages/Home";
import CreatePost from "@/pages/CreatePost";
import PostDetail from "@/pages/PostDetail";
import EditPost from "@/pages/EditPost";
import MyPosts from "@/pages/MyPosts";
import NotFound from "@/pages/not-found";

// Layouts
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreatePost} />
      <Route path="/posts/:id" component={PostDetail} />
      <Route path="/posts/:id/edit" component={EditPost} />
      <Route path="/my-posts" component={MyPosts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto p-4">
              <Router />
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
