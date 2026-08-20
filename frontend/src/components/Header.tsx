import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { logout } from "@/api/auth.api";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  CalendarDays,
  LogOut,
  MessageCircle,
  Plus,
  Tent,
  User,
} from "lucide-react";

const Header = () => {
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const initials =
    user?.fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          state={{ action: "refresh" }}
          className="text-xl font-bold tracking-tight"
        >
          YelpCamp
        </Link>

        {!user ? (
          <div className="flex items-center gap-2">
            <Button
              nativeButton={false}
              variant="ghost"
              render={<Link to="/login" />}
            >
              Log in
            </Button>

            <Button nativeButton={false} render={<Link to="/register" />}>
              Sign up
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="rounded-full outline-none transition hover:opacity-80"
                  aria-label="Open user menu"
                />
              }
            >
              <Avatar className="size-10">
                <AvatarImage src={user.imageUrl} alt={user.username} />

                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{user.fullName}</span>

                    <span className="text-xs font-normal text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link to={`/profile`} />}>
                  <User className="size-4" />
                  My profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link to="/bookings" />}>
                  <CalendarDays className="size-4" />
                  My bookings
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link to="/campgrounds/new" />}>
                  <Plus className="size-4" />
                  Add campground
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link to={`/campgrounds/user/${user._id}`} />}
                >
                  <Tent className="size-4" />
                  My campgrounds
                </DropdownMenuItem>

                <DropdownMenuItem render={<Link to="/conversations" />}>
                  <MessageCircle className="size-4" />
                  Conversations
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
