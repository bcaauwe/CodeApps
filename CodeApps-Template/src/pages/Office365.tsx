import { Text, Card, makeStyles, shorthands, tokens, Input, Badge, Spinner, Avatar, Textarea, Dialog, DialogSurface, DialogBody, DialogTitle, DialogActions, Button, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Dropdown, Option } from '@fluentui/react-components';
import { PeopleRegular, SearchRegular, PersonRegular, MailRegular, ChatRegular, CalendarRegular, CalendarAddRegular, MailFilled } from '@fluentui/react-icons';
import { useState, useEffect, useCallback } from 'react';
import { Office365UsersService } from '../generated/services/Office365UsersService';
import type { User } from '../generated/models/Office365UsersModel';
import { Office365OutlookService } from '../generated/services/Office365OutlookService';
import { GlobalCountryHolidaysService } from '../generated/services/GlobalCountryHolidaysService';
import type { GlobalCountryHolidaysRead } from '../generated/models/GlobalCountryHolidaysModel';
import { useTheme } from '../hooks/useTheme';

const useStyles = makeStyles({
  container: {
    width: '100%',
    ...shorthands.margin('0', 'auto'),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerIcon: {
    fontSize: '24px',
    color: tokens.colorBrandForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    marginBottom: '20px',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap('20px'),
    marginTop: '20px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    marginBottom: '16px',
  },
  sectionIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    ...shorthands.gap('16px'),
  },
  userCard: {
    ...shorthands.padding('16px'),
    height: 'fit-content',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  userCardHeader: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    marginBottom: '8px',
  },
  userName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
  },
  userDetails: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
  },
  searchBox: {
    maxWidth: '600px',
    width: '100%',
    marginBottom: '16px',
  },
  mockDataBadge: {
    marginBottom: '16px',
    width: '100%',
  },
  emailLink: {
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover': {
      color: tokens.colorBrandForeground2,
    },
  },
  emailSection: {
    maxWidth: '600px',
    marginBottom: '32px',
  },
  emailForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emailButton: {
    padding: '8px 16px',
    backgroundColor: tokens.colorBrandForeground1,
    color: tokens.colorNeutralForegroundOnBrand,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: tokens.colorBrandForeground2,
    },
  },
  holidaysCard: {
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground1,
    height: 'fit-content',
  },
  holidaysTable: {
    width: '100%',
    fontSize: tokens.fontSizeBase200,
  },
  holidayRow: {
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  pastHolidayRow: {
    opacity: '0.5',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1,
    },
  },
  holidayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  yearPickerCombo: {
    minWidth: '120px',
  },
});

export function Office365() {
  const styles = useStyles();
  const { primaryColor } = useTheme();

  // Helper function to lighten a hex color
  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [teamsMessage, setTeamsMessage] = useState('');
  const [holidays, setHolidays] = useState<GlobalCountryHolidaysRead[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedHolidayForCalendar, setSelectedHolidayForCalendar] = useState<GlobalCountryHolidaysRead | null>(null);
  const [calendarTitle, setCalendarTitle] = useState('');
  const [calendarDate, setCalendarDate] = useState('');
  const [calendarDescription, setCalendarDescription] = useState('');
  const [calendarStartTime, setCalendarStartTime] = useState('09:00');
  const [calendarEndTime, setCalendarEndTime] = useState('17:00');
  const [calendarIsAllDay, setCalendarIsAllDay] = useState(false);

  // Load current user profile
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const result = await Office365UsersService.MyProfile();
        if (result.data) {
          setCurrentUser(result.data);
          // Load the current user's photo
          const photo = await loadUserPhoto(result.data.Id);
          if (photo) {
            setUserPhotos(prev => ({ ...prev, [result.data.Id]: photo }));
          }
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  // Load company holidays
  useEffect(() => {
    const loadHolidays = async () => {
      setLoadingHolidays(true);
      try {
        const result = await GlobalCountryHolidaysService.getAll();
        if (result.success && result.data) {
          const sortedHolidays = result.data.sort((a, b) => {
            if (a.Date && b.Date) {
              return new Date(a.Date).getTime() - new Date(b.Date).getTime();
            }
            return 0;
          });
          setHolidays(sortedHolidays);
        }
      } catch (error) {
        console.error('Error loading holidays:', error);
      } finally {
        setLoadingHolidays(false);
      }
    };
    loadHolidays();
  }, []);

  // Load user photo
  const loadUserPhoto = async (userId: string): Promise<string | null> => {
    try {
      const result = await Office365UsersService.UserPhoto(userId);
      if (result.data) {
        return `data:image/jpeg;base64,${result.data}`;
      }
    } catch (error) {
      console.error(`Error loading photo for user ${userId}:`, error);
    }
    return null;
  };

  // Helper function to load user photos
  const loadPhotosForUsers = useCallback(async (newUsers: User[]) => {
    const photoPromises = newUsers.map(async (user: User) => {
      const photo = await loadUserPhoto(user.Id);
      return { userId: user.Id, photo };
    });
    
    const photoResults = await Promise.all(photoPromises);
    const photoMap: Record<string, string> = {};
    photoResults.forEach(({ userId, photo }: { userId: string, photo: string | null }) => {
      if (photo) {
        photoMap[userId] = photo;
      }
    });
    
    setUserPhotos(prev => ({ ...prev, ...photoMap }));
  }, []);

  // Helper function to get available years from holidays
  const getAvailableYears = useCallback((): string[] => {
    const years = new Set<string>();
    holidays.forEach(holiday => {
      if (holiday.Date) {
        const year = new Date(holiday.Date).getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort().reverse();
  }, [holidays]);

  // Helper function to filter holidays by selected year
  const getFilteredHolidays = useCallback((): GlobalCountryHolidaysRead[] => {
    return holidays.filter(holiday => {
      if (holiday.Date) {
        return new Date(holiday.Date).getFullYear().toString() === selectedYear;
      }
      return false;
    });
  }, [holidays, selectedYear]);

  // Helper function to get badge color based on holiday type
  // Helper function to determine if holiday is national or company type
  const getHolidayType = (holidayType: string | undefined): 'national' | 'company' => {
    if (!holidayType) return 'national';
    
    const type = holidayType.toLowerCase();
    
    // National holidays use the app's primary theme color
    const nationalHolidays = ['national', 'federal', 'public', 'bank', 'us', 'uk', 'ca', 'mx', 'de', 'fr', 'it', 'es', 'au'];
    
    // Company holidays use green for visual distinction
    const companyHolidays = ['company', 'corporate', 'religious', 'cultural', 'observance', 'state'];
    
    for (const keyword of nationalHolidays) {
      if (type.includes(keyword)) {
        return 'national';
      }
    }
    
    for (const keyword of companyHolidays) {
      if (type.includes(keyword)) {
        return 'company';
      }
    }
    
    return 'national';
  };

  // Helper function to get badge style based on holiday type - uses app theme
  const getHolidayBadgeStyle = (holidayType: string | undefined): React.CSSProperties => {
    const type = getHolidayType(holidayType);
    
    if (type === 'company') {
      return {
        backgroundColor: '#d4edda', // Light green fill
        color: '#155724', // Dark green text
        borderColor: '#28a745', // Standard green border
        paddingLeft: '12px',
        paddingRight: '12px',
      };
    }
    
    return {
      backgroundColor: lightenColor(primaryColor, 60), // Lighter tint of theme color for better contrast
      color: primaryColor, // Text uses full theme color
      borderColor: primaryColor, // Border uses full theme color
      paddingLeft: '12px',
      paddingRight: '12px',
    };
  };

  // Helper function to check if a holiday has passed
  const isHolidayPassed = (holidayDate: string | undefined): boolean => {
    if (!holidayDate) return false;
    const holiday = new Date(holidayDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    holiday.setHours(0, 0, 0, 0);
    return holiday < today;
  };

  // Helper function to handle opening the calendar add dialog
  const handleAddToCalendar = (holiday: GlobalCountryHolidaysRead) => {
    setSelectedHolidayForCalendar(holiday);
    setCalendarTitle(holiday.Holiday || '');
    setCalendarDate(holiday.Date || '');
    setCalendarDescription(holiday.Title || '');
    setCalendarStartTime('09:00');
    setCalendarEndTime('17:00');
    setCalendarIsAllDay(true);
  };

  // Helper function to handle adding holiday to calendar
  const handleAddHolidayToCalendar = async () => {
    if (calendarTitle && calendarDate) {
      try {
        const dateObj = new Date(calendarDate);
        const dateStr = dateObj.toISOString().split('T')[0];
        
        let startDateTime: string;
        let endDateTime: string;
        
        if (calendarIsAllDay) {
          startDateTime = `${dateStr}T00:00:00`;
          endDateTime = `${dateStr}T23:59:59`;
        } else {
          startDateTime = `${dateStr}T${calendarStartTime}:00`;
          const endHour = calendarEndTime.split(':')[0];
          const endMinute = calendarEndTime.split(':')[1] || '00';
          endDateTime = `${dateStr}T${endHour}:${endMinute}:00`;
        }
        
        const eventData = {
          subject: calendarTitle,
          start: startDateTime,
          end: endDateTime,
          timeZone: '(UTC) Coordinated Universal Time' as any,
          body: calendarDescription,
          isAllDay: calendarIsAllDay,
          showAs: 'oof' as any,
        };
        
        const result = await Office365OutlookService.V4CalendarPostItem('Calendar', eventData);
        
        if (result.success) {
          console.log('Holiday added to calendar successfully:', result.data);
          setSelectedHolidayForCalendar(null);
          setCalendarTitle('');
          setCalendarDate('');
          setCalendarDescription('');
          setCalendarStartTime('09:00');
          setCalendarEndTime('17:00');
          setCalendarIsAllDay(false);
          alert('Holiday successfully added to your calendar!');
        } else {
          throw new Error(result.error?.message || 'Failed to add event to calendar');
        }
      } catch (error) {
        console.error('Error adding to calendar:', error);
        alert('Failed to add holiday to calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      alert('Please fill in Title and Date');
    }
  };

  // Search users with simple SearchUser approach
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setUsers([]);
      
      try {
        const pageSize = 50;
        const result = await Office365UsersService.SearchUser(
          searchTerm.trim(),
          pageSize
        );
        
        if (result.success && result.data) {
          setUsers(result.data);
          await loadPhotosForUsers(result.data);
        } else {
          console.error('Search failed:', result.error?.message);
          setUsers([]);
        }
              
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, loadPhotosForUsers]);

  // Helper function to handle sending Teams message
  const handleTeamsMessage = async () => {
    if (selectedUserForChat && teamsMessage) {
      try {
        console.log('Teams integration not yet configured');
        setSelectedUserForChat(null);
        setTeamsMessage('');
      } catch (error) {
        console.error('Error sending Teams message:', error);
        alert('Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      alert('Please enter a message');
    }
  };

  // Helper function to handle sending email
  const handleSendEmail = async () => {
    if (selectedUserForEmail && emailSubject && emailBody) {
      try {
        const result = await Office365OutlookService.SendEmail({
          To: selectedUserForEmail?.Mail || '',
          Subject: emailSubject,
          Body: emailBody,
          Importance: 'Normal',
        });

        if (result.success) {
          console.log('Email sent successfully');
          
          setSelectedUserForEmail(null);
          setEmailSubject('');
          setEmailBody('');
        } else {
          console.error('Failed to send email:', result.error?.message);
          alert('Failed to send email: ' + result.error?.message);
        }
      } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email');
      }
    } else {
      alert('Please fill in all email fields');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <MailFilled className={styles.headerIcon} />
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: tokens.fontSizeBase500 }}>Office 365</h1>
          <p style={{ margin: '0', fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>Leverage Microsoft 365 services</p>
        </div>
      </div>

      {currentUser ? (
        <Badge className={styles.mockDataBadge} appearance="tint" color="important">
          📋 Welcome, {currentUser.DisplayName}!
        </Badge>
      ) : (
        <Badge className={styles.mockDataBadge} appearance="tint" color="brand">
          🔄 Loading user data...
        </Badge>
      )}

      <div className={styles.mainContent}>
        {/* Left Column: Office 365 Content */}
        <div className={styles.leftColumn}>

          {/* Current User Profile Section */}
          {currentUser && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <PersonRegular className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>My Profile</h3>
              </div>
              
              <Card className={styles.userCard} style={{ maxWidth: '600px' }}>
                <div className={styles.userCardHeader}>
                  <Avatar
                    name={currentUser.DisplayName}
                    size={64}
                    image={userPhotos[currentUser.Id] ? { src: userPhotos[currentUser.Id] } : undefined}
                  />
                  <div>
                    <div className={styles.userName} style={{ fontSize: tokens.fontSizeBase400 }}>
                      {currentUser.DisplayName}
                    </div>
                    <div style={{ fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground2, fontWeight: tokens.fontWeightMedium }}>
                      {currentUser.JobTitle}
                    </div>
                  </div>
                </div>
                <div className={styles.userDetails}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div><strong>Email:</strong> {currentUser.Mail || 'Not available'}</div>
                      <div><strong>User Principal:</strong> {currentUser.UserPrincipalName || 'Not available'}</div>
                      <div><strong>Department:</strong> {currentUser.Department || 'Not specified'}</div>
                      <div><strong>Company:</strong> {currentUser.CompanyName || 'Not specified'}</div>
                    </div>
                    <div>
                      <div><strong>Office:</strong> {currentUser.OfficeLocation || 'Not specified'}</div>
                      <div><strong>Mobile:</strong> {currentUser.mobilePhone || 'Not available'}</div>
                      <div><strong>Business Phone:</strong> {currentUser.BusinessPhones?.length ? currentUser.BusinessPhones[0] : 'Not available'}</div>
                      <div><strong>City:</strong> {currentUser.City || 'Not specified'}</div>
                    </div>
                  </div>
                  
                  {(currentUser.GivenName || currentUser.Surname || currentUser.Country || currentUser.PostalCode) && (
                    <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '12px', marginTop: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          {currentUser.GivenName && <div><strong>First Name:</strong> {currentUser.GivenName}</div>}
                          {currentUser.Surname && <div><strong>Last Name:</strong> {currentUser.Surname}</div>}
                        </div>
                        <div>
                          {currentUser.Country && <div><strong>Country:</strong> {currentUser.Country}</div>}
                          {currentUser.PostalCode && <div><strong>Postal Code:</strong> {currentUser.PostalCode}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '12px', marginTop: '12px', fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                    <div><strong>Account Status:</strong> {currentUser.AccountEnabled ? '✅ Active' : '❌ Disabled'}</div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Users Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <PeopleRegular className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Organization Directory</h3>
            </div>
            
            <Input
              className={styles.searchBox}
              placeholder="Enter a search term to find users in your organization..."
              contentBefore={<SearchRegular />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.grid}>
              {loading && users.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: tokens.colorNeutralBackground1 }}>
                  <Spinner size="medium" label="Loading users..." />
                </div>
              )}
              {users.map((user: User) => (
                <Card key={user.Id} className={styles.userCard}>
                  <div className={styles.userCardHeader}>
                    <Avatar
                      name={user.DisplayName}
                      size={48}
                      image={userPhotos[user.Id] ? { src: userPhotos[user.Id] } : undefined}
                    />
                    <div>
                      <div className={styles.userName}>{user.DisplayName}</div>
                      <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>
                        {user.JobTitle || 'No title specified'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.userDetails}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: tokens.fontSizeBase200 }}>
                          <strong>Email:</strong>{' '}
                          {user.Mail ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                              }}
                              onClick={() => setSelectedUserForEmail(user)}
                            >
                              {user.Mail}
                              <MailRegular style={{ color: tokens.colorBrandForeground1, fontSize: '16px' }} />
                              <ChatRegular
                                style={{ color: tokens.colorBrandForeground1, fontSize: '16px', cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserForChat(user);
                                }}
                              />
                            </span>
                          ) : (
                            'Not available'
                          )}
                        </div>
                        <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>Department:</strong> {user.Department || 'Not specified'}</div>
                        <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>Office:</strong> {user.OfficeLocation || 'Not specified'}</div>
                        {user.mobilePhone && <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>Mobile:</strong> {user.mobilePhone}</div>}
                        {user.BusinessPhones?.length && <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>Business Phone:</strong> {user.BusinessPhones[0]}</div>}
                      </div>
                    </div>
                    
                    {(user.CompanyName || user.City || user.Country) && (
                      <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '8px', marginTop: '8px' }}>
                        {user.CompanyName && <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>Company:</strong> {user.CompanyName}</div>}
                        {user.City && <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>City:</strong> {user.City}</div>}
                        {user.Country && <div style={{ fontSize: tokens.fontSizeBase200 }}><strong>Country:</strong> {user.Country}</div>}
                      </div>
                    )}
                    
                    <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '8px', marginTop: '8px', fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>
                      <div><strong>Status:</strong> {user.AccountEnabled ? '✅ Active' : '❌ Disabled'}</div>
                    </div>
                  </div>
                </Card>
              ))}
              {!loading && !searchTerm.trim() && (
                <div style={{ padding: '20px', textAlign: 'center', color: tokens.colorNeutralForeground2 }}>
                  <SearchRegular style={{ fontSize: '48px', marginBottom: '8px' }} />
                  <div>Enter a search term to find users in your organization</div>
                </div>
              )}
              {!loading && searchTerm && users.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: tokens.colorNeutralForeground2 }}>
                  <PersonRegular style={{ fontSize: '48px', marginBottom: '8px' }} />
                  <div>No users found for "{searchTerm}"</div>
                </div>
              )}
            </div>
            
            {users.length > 0 && (
              <Text style={{ marginTop: '16px', color: tokens.colorNeutralForeground2, textAlign: 'center', display: 'block' }}>
                Showing {users.length} users
              </Text>
            )}
          </section>
        </div>

        {/* Right Column: Company Holidays */}
        <div className={styles.rightColumn}>
          <Card className={styles.holidaysCard}>
            <div className={styles.holidayHeader}>
              <div className={styles.sectionHeader} style={{ marginBottom: '0' }}>
                <CalendarRegular className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Company Holidays</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: tokens.fontSizeBase200 }}>Year:</span>
                <Dropdown
                  className={styles.yearPickerCombo}
                  value={selectedYear}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      setSelectedYear(data.optionValue);
                    }
                  }}
                >
                  {getAvailableYears().map(year => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Dropdown>
              </div>
            </div>
            {loadingHolidays ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Spinner size="small" label="Loading..." />
              </div>
            ) : getFilteredHolidays().length > 0 ? (
              <Table className={styles.holidaysTable}>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Holiday</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredHolidays().map((holiday) => (
                    <TableRow 
                      key={holiday.ID} 
                      className={isHolidayPassed(holiday.Date) ? styles.pastHolidayRow : styles.holidayRow}
                    >
                      <TableCell>
                        <CalendarAddRegular 
                          style={{ fontSize: '18px', color: tokens.colorBrandForeground1, marginRight: '4px' }}
                          onClick={() => handleAddToCalendar(holiday)}
                          title="Add to Calendar"
                        />
                        {holiday.Date ? new Date(holiday.Date).toLocaleDateString("en-US", { timeZone: "UTC"}) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge style={{ ...getHolidayBadgeStyle(holiday.Title), border: `1px solid ${getHolidayBadgeStyle(holiday.Title).borderColor}` }}>
                          {holiday.Title || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightMedium }}>
                        {holiday.Holiday || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase200 }}>
                No holidays found for {selectedYear}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Teams Chat Section */}
      <Dialog open={selectedUserForChat !== null} onOpenChange={() => setSelectedUserForChat(null)}>
        <DialogSurface style={{ maxWidth: '600px', width: '90vw' }}>
          <DialogBody style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <DialogTitle>Send Message to {selectedUserForChat?.DisplayName}</DialogTitle>
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <Textarea
                placeholder="Enter your message"
                value={teamsMessage}
                onChange={(e) => setTeamsMessage(e.target.value)}
                style={{ minHeight: '150px', verticalAlign: 'top', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <DialogActions>
              <Button onClick={() => {
                setSelectedUserForChat(null);
                setTeamsMessage('');
              }}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleTeamsMessage}>
                Send Message
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add to Calendar Section */}
      <Dialog open={selectedHolidayForCalendar !== null} onOpenChange={() => setSelectedHolidayForCalendar(null)}>
        <DialogSurface style={{ maxWidth: '600px', width: '90vw' }}>
          <DialogBody style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <DialogTitle>Add Holiday to Calendar</DialogTitle>
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: tokens.fontSizeBase200 }}>
                  Title
                </label>
                <Input
                  value={calendarTitle}
                  onChange={(e) => setCalendarTitle(e.target.value)}
                  placeholder="Holiday title"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: tokens.fontSizeBase200 }}>
                  Date
                </label>
                <Input
                  type="date"
                  value={calendarDate ? new Date(calendarDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: tokens.fontSizeBase200 }}>
                  <input
                    type="checkbox"
                    checked={calendarIsAllDay}
                    onChange={(e) => setCalendarIsAllDay(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  All Day Event
                </label>
              </div>
              {!calendarIsAllDay && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: tokens.fontSizeBase200 }}>
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={calendarStartTime}
                      onChange={(e) => setCalendarStartTime(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: tokens.fontSizeBase200 }}>
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={calendarEndTime}
                      onChange={(e) => setCalendarEndTime(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: tokens.fontSizeBase200 }}>
                  Description
                </label>
                <Textarea
                  value={calendarDescription}
                  onChange={(e) => setCalendarDescription(e.target.value)}
                  placeholder="Holiday description"
                  style={{ minHeight: '100px', verticalAlign: 'top', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <DialogActions>
              <Button onClick={() => setSelectedHolidayForCalendar(null)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleAddHolidayToCalendar}>
                Add to Calendar
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Email Composition Section */}
      <Dialog open={selectedUserForEmail !== null} onOpenChange={() => setSelectedUserForEmail(null)}>
        <DialogSurface style={{ maxWidth: '600px', width: '90vw' }}>
          <DialogBody style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <DialogTitle>Send Email to {selectedUserForEmail?.DisplayName}</DialogTitle>
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <Input
                value={selectedUserForEmail?.Mail || ''}
                disabled
              />
              <Input
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <Textarea
                placeholder="Enter email body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                style={{ minHeight: '150px', verticalAlign: 'top' }}
              />
            </div>
            <DialogActions>
              <Button onClick={() => {
                setSelectedUserForEmail(null);
                setEmailSubject('');
                setEmailBody('');
              }}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleSendEmail}>
                Send Email
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
