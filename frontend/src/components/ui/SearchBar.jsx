import { Search } from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";

export function SearchBar() {
  return <SearchInput icon={<Search size={17} strokeWidth={1.75} aria-hidden="true" />} />;
}
