import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    placeholder?: string;
    className?: string;
}

export function SearchInput({
    placeholder = "Search patients, appointments...",
    className = ""
}: SearchInputProps) {
    return (
        <div className={`relative max-w-md flex-1 ${className}`}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-10 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-1"
            />
        </div>
    );
}
