"use client";
import { logout } from "@/app/api/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUserIcon as UserIcon, LogOut, Settings, MessageCircle, ListCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const router = useRouter();
  const out = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserIcon className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-4">
      <Link href="/me/">
          <DropdownMenuItem className="cursor-pointer">
            <ListCheck className="mr-2 h-4 w-4" /> My Diet
          </DropdownMenuItem>
        </Link>
        <Link href="/me/profile">
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" /> My Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/me/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
        </Link>
        <Link href="/contact">
          <DropdownMenuItem className="cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" /> Contact
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={out} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
