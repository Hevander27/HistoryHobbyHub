import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          HistoryHub
        </Link>
        
        <form 
          className="relative w-full max-w-md mx-4 my-2 md:my-0 order-3 md:order-2"
          onSubmit={handleSearch}
        >
          <Input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 rounded-full text-gray-800 focus:outline-none pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <Search size={18} />
          </button>
        </form>
        
        <nav className="flex items-center space-x-4 order-2 md:order-3">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/my-posts" className="hover:underline">
            My Posts
          </Link>
          <Link href="/create" className="hover:underline">
            Create New Post
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
