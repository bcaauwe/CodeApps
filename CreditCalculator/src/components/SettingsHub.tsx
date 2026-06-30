import React from 'react';
import {
  Button,
  Card,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  People24Regular,
  Money24Regular,
  Options24Regular,
  Apps24Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import { useConfigurationStatus } from '../hooks/useConfigurationStatus';

interface SettingsHubProps {
  onNavigate: (page: 'admin-personas' | 'admin-pricing' | 'admin-products' | 'calculator-settings') => void;
  onBack: () => void;
  userPrivileges: Record<string, unknown> | null;
}

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXXL,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    padding: tokens.spacingVerticalL,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  cardDisabled: {
    padding: tokens.spacingVerticalL,
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  cardIcon: {
    fontSize: '24px',
    color: tokens.colorBrandForeground1,
  },
  cardText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
  },
  cardDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  configRequired: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorPaletteYellowForeground2,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
});

export const SettingsHub: React.FC<SettingsHubProps> = ({ onNavigate, onBack, userPrivileges }) => {
  const styles = useStyles();
  const configStatus = useConfigurationStatus();

  const rolePrivileges = userPrivileges
    ? (userPrivileges.RolePrivileges as Array<Record<string, unknown>>) ?? []
    : null;

  function hasPrivilege(privilegeName: string): boolean | null {
    if (!rolePrivileges) return null;
    return rolePrivileges.some((priv) => priv.PrivilegeName === privilegeName);
  }

  const canCreateCalculatorSetting = hasPrivilege('prvCreategbb_CalculatorSetting');

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack} aria-label="Back" />
        <Text className={styles.title}>Settings</Text>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card} onClick={() => onNavigate('admin-personas')}>
          <div className={styles.cardContent}>
            <People24Regular className={styles.cardIcon} />
            <div className={styles.cardText}>
              <Text className={styles.cardTitle}>Personas</Text>
              <Text className={styles.cardDescription}>Manage persona definitions and complexity levels</Text>
              {configStatus.personas === false && (
                <div className={styles.configRequired}>
                  <Warning16Regular />
                  <span>Configuration Required</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className={styles.card} onClick={() => onNavigate('admin-pricing')}>
          <div className={styles.cardContent}>
            <Money24Regular className={styles.cardIcon} />
            <div className={styles.cardText}>
              <Text className={styles.cardTitle}>Pricing</Text>
              <Text className={styles.cardDescription}>Configure credit pricing models and tiers</Text>
              {configStatus.pricing === false && (
                <div className={styles.configRequired}>
                  <Warning16Regular />
                  <span>Configuration Required</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className={styles.card} onClick={() => onNavigate('admin-products')}>
          <div className={styles.cardContent}>
            <Apps24Regular className={styles.cardIcon} />
            <div className={styles.cardText}>
              <Text className={styles.cardTitle}>Products</Text>
              <Text className={styles.cardDescription}>Manage products used in credit calculations</Text>
              {configStatus.products === false && (
                <div className={styles.configRequired}>
                  <Warning16Regular />
                  <span>Configuration Required</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className={canCreateCalculatorSetting === false ? styles.cardDisabled : styles.card} onClick={canCreateCalculatorSetting !== false ? () => onNavigate('calculator-settings') : undefined}>
          <div className={styles.cardContent}>
            <Options24Regular className={styles.cardIcon} />
            <div className={styles.cardText}>
              <Text className={styles.cardTitle}>Calculator</Text>
              <Text className={styles.cardDescription}>Adjust calculator parameters like working days</Text>
              {configStatus.calculatorSettings === false && (
                <div className={styles.configRequired}>
                  <Warning16Regular />
                  <span>Configuration Required</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
