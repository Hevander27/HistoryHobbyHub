const Footer = () => {
  return (
    <footer className="bg-white py-4 border-t border-neutral-medium">
      <div className="container mx-auto px-4 text-center text-neutral-dark">
        <p>&copy; {new Date().getFullYear()} HistoryHub. Share your passion for history.</p>
      </div>
    </footer>
  );
};

export default Footer;
