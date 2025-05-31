import { FileText } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 border-b">
      <div className="container mx-auto flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <Link href="/" className="text-2xl font-headline font-semibold tracking-tight">
          Reportify AI
        </Link>
      </div>
    </header>
  );
}
