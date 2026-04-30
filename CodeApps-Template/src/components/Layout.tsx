import type { ReactNode } from 'react'
import { makeStyles, shorthands, tokens, Button, Breadcrumb, BreadcrumbItem, BreadcrumbDivider, Text, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components'
import { HomeRegular, HomeFilled, NavigationRegular, PeopleRegular, PeopleFilled, WeatherMoonRegular, WeatherSunnyRegular, ColorRegular, MoreVerticalRegular, MailRegular, MailFilled, VideoRegular, VideoFilled } from '@fluentui/react-icons'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import ThemePickerDialog from './ThemePickerDialog'
import { Office365UsersService } from '../generated/services/Office365UsersService'
import type { GraphUser_V1 } from '../generated/models/Office365UsersModel'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  layoutContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    marginTop: '64px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      marginTop: '64px',
    },
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('32px', '16px', '16px', '16px'),
    position: 'relative',
    top: 0,
    left: 0,
    height: 'calc(100vh - 64px)',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      position: 'fixed',
      width: '100vw',
      transform: 'translateX(-100%)',
      top: '64px',
      left: 0,
      height: 'calc(100vh - 64px)',
      zIndex: 1000,
      flexShrink: 1,
    },
  },
  sidebarVisible: {
    '@media (max-width: 768px)': {
      transform: 'translateX(0) !important',
    },
  },
  sidebarCollapsed: {
    width: '60px',
    '@media (max-width: 768px)': {
      transform: 'translateX(-100%)',
    },
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  appHeader: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('8px', '16px'),
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    minHeight: '64px',
    boxShadow: tokens.shadow4,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: 0,
  },
  headerCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 0,
    marginTop: 0,
    width: '100%',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      marginLeft: 0,
      marginTop: 0,
      width: '100%',
    },
  },
  contentCollapsed: {
    marginLeft: 0,
    marginTop: 0,
    width: '100%',
    '@media (max-width: 768px)': {
      marginLeft: 0,
      marginTop: 0,
      width: '100%',
    },
  },
  navList: {
    listStyle: 'none',
    ...shorthands.margin(0),
    ...shorthands.padding(0),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  navItem: {
    display: 'flex',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    ...shorthands.padding('12px', '16px'),
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2,
    backgroundColor: 'transparent',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('2px', 'solid', 'transparent'),
    width: '100%',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
      transform: 'translateY(-1px)',
    },
    '&:focus': {
      outline: `2px solid ${tokens.colorBrandBackground}`,
      outlineOffset: '2px',
    },
  },
  navLinkActive: {
    backgroundColor: `${tokens.colorBrandBackground} !important`,
    color: `${tokens.colorNeutralForegroundOnBrand} !important`,
    fontWeight: '600',
    ...shorthands.border('2px', 'solid', tokens.colorBrandBackgroundSelected),
    boxShadow: `0 4px 8px ${tokens.colorNeutralShadowAmbient}, 0 2px 4px ${tokens.colorNeutralShadowKey}`,
    transform: 'translateY(-2px)',
    '&:hover': {
      backgroundColor: `${tokens.colorBrandBackgroundHover} !important`,
      color: `${tokens.colorNeutralForegroundOnBrand} !important`,
      transform: 'translateY(-2px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-16px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '24px',
      backgroundColor: tokens.colorBrandForeground1,
      ...shorthands.borderRadius('2px'),
    },
  },
  navLinkCollapsed: {
    justifyContent: 'center',
    ...shorthands.padding('12px'),
  },
  navText: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: 'inherit',
  },
  navTextActive: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: 'inherit',
  },
  navDescription: {
    fontSize: tokens.fontSizeBase200,
    marginTop: '2px',
    opacity: 0.9,
    color: 'inherit',
  },
  navIcon: {
    fontSize: '20px',
    transition: 'transform 0.2s ease-in-out',
    minWidth: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    fontSize: '20px',
    transform: 'scale(1.1)',
    minWidth: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    ...shorthands.padding('24px'),
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    overflow: 'auto',
    '@media (max-width: 768px)': {
      ...shorthands.padding('16px'),
    },
  },
  toggleButton: {
    minWidth: 'auto',
    width: '32px',
    height: '32px',
    '& svg': {
      transition: 'color 0.2s ease',
    },
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorBrandForeground1,
    },
    ':hover svg': {
      color: `${tokens.colorBrandForeground1} !important`,
    },
  },
  bottomButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('12px', '0px'),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: '8px',
  },
  userProfileSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
    ...shorthands.padding('12px'),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: '8px',
    marginBottom: '32px',
    marginLeft: '-16px',
    marginRight: '-16px',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '16px',
    flexShrink: 0,
  },
  userProfileContent: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    flex: 1,
    minWidth: 0,
  },
  userProfileMenuButton: {
    minWidth: 'auto',
    width: '32px',
    height: '32px',
    padding: '0',
    flexShrink: 0,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorBrandForeground1,
    },
  },
  userProfilePhoto: {
    width: '20px',
    height: '20px',
    ...shorthands.borderRadius('50%'),
    objectFit: 'cover',
    backgroundColor: tokens.colorNeutralBackground3,
    border: `2px solid ${tokens.colorNeutralStroke2}`,
  },
  userProfileInfo: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('2px'),
    flex: 1,
    minWidth: 0,
  },
  userProfileName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userProfileEmail: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  themePickerToggle: {
    display: 'flex',
    justifyContent: 'center',
  },
  themeToggle: {
    display: 'flex',
    justifyContent: 'center',
  },
  menuItem: {
    '& svg': {
      transition: 'color 0.2s ease',
    },
    '&:hover svg': {
      color: `${tokens.colorBrandForeground1} !important`,
    },
  },
})

interface NavItem {
  path: string
  label: string
  description: string
  icon: React.ReactElement
  iconFilled: React.ReactElement
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    description: 'Welcome and overview',
    icon: <HomeRegular />,
    iconFilled: <HomeFilled />,
  },
  {
    path: '/office365',
    label: 'Office 365',
    description: 'Levarage Microsoft 365 services',
    icon: <MailRegular />,
    iconFilled: <MailFilled />,
  },
  {
    path: '/customers',
    label: 'Customers',
    description: 'Work with customer data',
    icon: <PeopleRegular />,
    iconFilled: <PeopleFilled />,
  },
  {
    path: '/tmdb',
    label: 'Movie Database',
    description: 'Use custom connectors to browse movies through a custom API',
    icon: <VideoRegular />,
    iconFilled: <VideoFilled />,
  },
]

const routeNames: Record<string, string> = {
  '/': 'Home',
  '/office365': 'Office 365',
  '/customers': 'Customers',
  '/tmdb': 'Movie Database',
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const styles = useStyles()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<GraphUser_V1 | null>(null)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const result = await Office365UsersService.MyProfile_V2('displayName,mail,userPrincipalName,mailNickname,id')
        
        // Try multiple ways to extract the data from IOperationResult
        if (result) {
          let profileData: GraphUser_V1 | null = null
          
          // Direct result
          if ('displayName' in result) {
            profileData = result as GraphUser_V1
          }
          // Check if it has a data property
          else if ('data' in result && result.data) {
            profileData = result.data as GraphUser_V1
          }
          // Check if it has a value property
          else if ('value' in result && result.value) {
            profileData = result.value as GraphUser_V1
          }
          
          if (profileData) {
            setUserProfile(profileData)
            
            // Fetch user photo if we have the user ID
            if (profileData.id) {
              try {
                const photoResult = await Office365UsersService.UserPhoto_V2(profileData.id)
                if (photoResult) {
                  let photoData: string | null = null
                  
                  // Direct result (already a string)
                  if (typeof photoResult === 'string') {
                    photoData = photoResult
                  }
                  // Check if it has a data property
                  else if ('data' in photoResult && typeof photoResult.data === 'string') {
                    photoData = photoResult.data
                  }
                  // Check if it has a value property
                  else if ('value' in photoResult && typeof photoResult.value === 'string') {
                    photoData = photoResult.value
                  }
                  
                  if (photoData) {
                    setUserPhoto(photoData)
                  }
                }
              } catch (photoError) {
                console.log('User photo not available or could not be fetched:', photoError)
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ path: '/', name: 'Home' }]

    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      const routeName = routeNames[currentPath]
      if (routeName) {
        breadcrumbs.push({ path: currentPath, name: routeName })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const handleMobileClose = () => {
    setMobileMenuOpen(false)
  }

  const sidebarClassName = `${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
    mobileMenuOpen ? styles.sidebarVisible : ''
  }`

  const contentClassName = `${styles.content} ${collapsed ? styles.contentCollapsed : ''}`

  return (
    <div className={styles.root}>
      {/* Fixed App Header */}
      <header className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <Button
            icon={<NavigationRegular />}
            appearance="subtle"
            className={styles.toggleButton}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
          <Breadcrumb aria-label="Breadcrumb navigation">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <Text weight="semibold">{crumb.name}</Text>
                  ) : (
                    <Link
                      to={crumb.path}
                      style={{
                        textDecoration: 'none',
                        color: tokens.colorBrandForeground1,
                      }}
                    >
                      {crumb.name}
                    </Link>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbDivider />}
              </div>
            ))}
          </Breadcrumb>
        </div>

        <div className={styles.headerCenter}>
          <img 
            src="/PowerApps.png" 
            alt="Power Apps" 
            style={{ 
              width: '28px', 
              height: '28px', 
              marginRight: '12px' 
            }} 
          />
          <Text weight="semibold" size={500}>
            Code Apps
          </Text>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={handleMobileClose} />}

      {/* Layout Container - Sidebar and Content */}
      <div className={styles.layoutContainer}>
        {/* Sidebar */}
        <aside className={sidebarClassName}>
        <nav style={{ overflowY: 'auto', paddingRight: '4px', minHeight: 0, flex: 1, marginTop: '-16px', marginLeft: '-16px', marginRight: '-16px' }}>
          <ul className={styles.navList} style={{ paddingTop: '16px', paddingLeft: '16px', paddingRight: '12px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path} className={styles.navItem}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''} ${
                      collapsed ? styles.navLinkCollapsed : ''
                    }`}
                    title={collapsed ? `${item.label} - ${item.description}` : undefined}
                    onClick={handleMobileClose}
                  >
                    <span className={isActive ? styles.navIconActive : styles.navIcon}>
                      {isActive ? item.iconFilled : item.icon}
                    </span>
                    {!collapsed && (
                      <div>
                        <div className={isActive ? styles.navTextActive : styles.navText}>
                          {item.label}
                        </div>
                        <div className={styles.navDescription}>{item.description}</div>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        {userProfile && (
          <div className={styles.userProfileSection} style={collapsed ? { justifyContent: 'center' } : {}}>
            <div className={styles.userProfileContent} style={collapsed ? { flex: 'none' } : {}}>
              {userPhoto ? (
                <img 
                  src={userPhoto.startsWith('data:') ? userPhoto : `data:image/jpeg;base64,${userPhoto}`}
                  alt={userProfile.displayName || 'User'}
                  className={styles.userProfilePhoto}
                  style={{
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div 
                  className={styles.userProfilePhoto}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: tokens.colorBrandBackground,
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {userProfile.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              {!collapsed && (
                <div className={styles.userProfileInfo}>
                  <div className={styles.userProfileName}>
                    {userProfile.displayName || 'User'}
                  </div>
                  <div className={styles.userProfileEmail}>
                    {userProfile.mail || userProfile.userPrincipalName}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Settings Menu */}
            {!collapsed && (
              <Menu open={profileMenuOpen} onOpenChange={(_e, data) => setProfileMenuOpen(data.open)}>
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    icon={<MoreVerticalRegular />}
                    appearance="subtle"
                    className={styles.userProfileMenuButton}
                    title="Settings"
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <div style={{ padding: '8px 16px 8px 8px' }}>
                      <Text weight="semibold" size={300}>
                        Settings
                      </Text>
                    </div>
                    <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}` }} />
                    <MenuItem 
                      icon={<ColorRegular />}
                      className={styles.menuItem}
                      onClick={() => {
                        setThemePickerOpen(true)
                        setProfileMenuOpen(false)
                      }}
                    >
                      Theme Picker
                    </MenuItem>
                    <MenuItem 
                      icon={isDarkMode ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
                      className={styles.menuItem}
                      onClick={() => {
                        toggleTheme()
                        setProfileMenuOpen(false)
                      }}
                    >
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={contentClassName}>
        <main className={styles.main}>{children}</main>
      </div>
      </div>

      {/* Theme Picker Dialog */}
      <ThemePickerDialog open={themePickerOpen} onOpenChange={setThemePickerOpen} />
    </div>
  )
}
