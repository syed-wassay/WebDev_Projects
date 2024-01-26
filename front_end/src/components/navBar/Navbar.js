import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const pages = [{ title: "Home", path: "/" }, { title: "Help" }];

function NavBar({
  showHome = true,
  showToggleButton,
  toggleSidebar,
  setToggleSidebar,
  showSidebarIcon,
}) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [showDropdownButton, setShowDropdownButton] = React.useState(
    window.innerWidth < 900
  );

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleSidebarToggle = () => {
    setToggleSidebar(!toggleSidebar);
  };

  React.useEffect(() => {
    const handleResize = () => {
      setShowDropdownButton(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <AppBar position="static">
      <Container maxWidth="">
        <Toolbar disableGutters>
          <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
            {!showHome && showSidebarIcon && (
              <Button size="small" onClick={handleSidebarToggle}>
                <MenuIcon style={{ marginRight: "5px", color: "white" }} />
              </Button>
            )}
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                fontFamily: "monospace",
                fontWeight: 400,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              MP ASPHALT MAINTENANCE
            </Typography>
          </Box>

          {/* Right-side content */}
          {showHome && (
            <Box sx={{ flexGrow: 0, ml: 2 }}>
              {showDropdownButton ? (
                <Tooltip title="Open menu">
                  <IconButton onClick={handleOpenNavMenu} sx={{ p: 0 }}>
                    <MenuIcon style={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {pages.map((page) => (
                    <Link
                      to={page.path}
                      key={page.title}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        sx={{
                          my: 2,
                          color: "white",
                          display: "block",
                          marginLeft: "10px",
                        }}
                      >
                        {page.title}
                      </Button>
                    </Link>
                  ))}
                </Box>
              )}
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
              >
                {pages.map((page) => (
                  <Link
                    to={page.path}
                    key={page.title}
                    style={{ textDecoration: "none" }}
                    onClick={handleCloseNavMenu}
                  >
                    <MenuItem>
                      <Typography textAlign="center">{page.title}</Typography>
                    </MenuItem>
                  </Link>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;