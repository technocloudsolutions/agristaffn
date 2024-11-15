"use client";

import { Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ContactType } from '@/types/contacts';

interface SearchAndFilterProps {
  onSearch: (value: string) => void;
  onFilterType: (value: string) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  currentType?: string;
}

export default function SearchAndFilter({
  onSearch,
  onFilterType,
  onSort,
  loading,
  currentType = 'all'
}: SearchAndFilterProps) {
  const handleTypeFilter = (value: string) => {
    onFilterType(value === 'all' ? 'all' : value as ContactType);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder="Search contacts..."
        startContent={<Search className="text-default-300" size={18} />}
        onValueChange={onSearch}
        disabled={loading}
      />
      <div className="flex gap-3 flex-wrap">
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="flat" 
              startContent={<SlidersHorizontal size={16} />}
              endContent={<ChevronDown size={16} />}
              disabled={loading}
            >
              {currentType === 'all' ? 'Type' : currentType}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Type filter"
            onAction={(key) => handleTypeFilter(key as string)}
            selectedKeys={new Set([currentType])}
          >
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="Institute">Institute</DropdownItem>
            <DropdownItem key="Person">Person</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="flat" 
              startContent={<SlidersHorizontal size={16} />}
              endContent={<ChevronDown size={16} />}
              disabled={loading}
            >
              Sort By
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort options"
            onAction={(key) => {
              const [field, direction] = (key as string).split('-');
              onSort(field, direction as 'asc' | 'desc');
            }}
          >
            <DropdownItem key="fullName-asc">Name (A-Z)</DropdownItem>
            <DropdownItem key="fullName-desc">Name (Z-A)</DropdownItem>
            <DropdownItem key="department-asc">Department (A-Z)</DropdownItem>
            <DropdownItem key="department-desc">Department (Z-A)</DropdownItem>
            <DropdownItem key="createdAt-desc">Newest First</DropdownItem>
            <DropdownItem key="createdAt-asc">Oldest First</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
} 