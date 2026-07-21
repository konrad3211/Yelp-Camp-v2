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
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            YelpCamp
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" render={<Link to="/campgrounds" />}>
              Campgrounds
            </Button>

            {user && (
              <>
                <Button variant="ghost" render={<Link to="/campgrounds/new" />}>
                  Add campground
                </Button>

                <Button variant="ghost" render={<Link to="/conversations" />}>
                  Conversations
                </Button>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button variant="ghost" render={<Link to="/login" />}>
                Log in
              </Button>

              <Button render={<Link to="/register" />}>Sign up</Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-10 items-center justify-center rounded-md"
                aria-label="Open user menu"
              >
                <Avatar>
                  <AvatarImage src={user.imageUrl} alt={user.username} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.fullName}</span>

                      <span className="text-xs font-normal text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
