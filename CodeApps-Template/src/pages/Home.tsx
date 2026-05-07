import { Text, Card, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { MailRegular, ArrowRightRegular, VideoRegular, PeopleRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    ...shorthands.margin('0', 'auto'),
  },
  hero: {
    textAlign: 'center',
    ...shorthands.padding('64px', '24px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    marginBottom: '48px',
  },
  heroText: {
    fontSize: '48px',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    marginBottom: '32px',
    textShadow: `0 2px 4px ${tokens.colorNeutralShadowAmbient}`,
  },
  heroSubtext: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground2,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
  },
  card: {
    height: '100%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${tokens.colorNeutralShadowAmbient}`,
      ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
    },
  },
  cardIcon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground1,
    marginBottom: '16px',
  },
});

const pages = [
  {
    path: '/office365',
    title: 'Office 365',
    description: 'Explore user profiles and organizational directory integration with live Office 365 data. Interact with people through Outlook and Teams connectivity.',
    icon: <MailRegular />,
    features: ['User Profiles', 'Directory Search', 'Teams', 'Outlook', 'SharePoint'],
  },
  {
    path: '/customers',
    title: 'Customers',
    description: 'Manage customer accounts and contacts with full CRUD operations. Includes map visualization, inline editing, and data management patterns.',
    icon: <PeopleRegular />,
    features: ['Accounts', 'Contacts', 'Map View', 'Data Management'],
  },
  {
    path: '/tmdb',
    title: 'Movie Database',
    description: 'Discover how to integrate external APIs with Power Apps Code Apps. Browse trending movies, search by title, and explore movie details and reviews.',
    icon: <VideoRegular />,
    features: ['API Integration', 'Search & Filter', 'Reviews', 'User Profiles'],
  },
];

export function Home() {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroText}>Power Apps ❤️ Code</div>
        <Text className={styles.heroSubtext}>
          Building amazing experiences with modern web technologies
        </Text>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pages</h2>
        <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginBottom: '24px', display: 'block' }}>
          Each page demonstrates UI components, data handling, and integration points using Power Platform connectors.
        </Text>

        <div className={styles.grid}>
          {pages.map((page) => (
            <Card
              key={page.path}
              className={styles.card}
              onClick={() => navigate(page.path)}
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = tokens.shadow16;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = tokens.shadow4;
              }}
            >
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className={styles.cardIcon}>{page.icon}</div>
              </div>

              <div style={{ padding: '0 24px 24px' }}>
                <Text
                  as="h3"
                  weight="semibold"
                  size={400}
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: tokens.colorNeutralForeground1,
                  }}
                >
                  {page.title}
                </Text>

                <Text
                  size={300}
                  style={{
                    display: 'block',
                    marginBottom: '16px',
                    color: tokens.colorNeutralForeground2,
                    lineHeight: tokens.lineHeightBase300,
                  }}
                >
                  {page.description}
                </Text>

                <div style={{ marginBottom: '16px' }}>
                  {page.features.map((feature, index) => (
                    <Text
                      key={index}
                      size={200}
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        margin: '2px',
                        backgroundColor: tokens.colorNeutralBackground3,
                        borderRadius: tokens.borderRadiusSmall,
                        fontSize: '12px',
                        color: tokens.colorNeutralForeground2,
                      }}
                    >
                      {feature}
                    </Text>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: tokens.colorBrandForeground1,
                  fontWeight: tokens.fontWeightSemibold,
                  fontSize: tokens.fontSizeBase200,
                }}>
                  <span>Explore</span>
                  <ArrowRightRegular />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
