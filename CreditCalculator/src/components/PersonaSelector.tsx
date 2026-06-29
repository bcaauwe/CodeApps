import React from 'react';
import {
  Card,
  Text,
  Button,
  makeStyles,
  tokens,
  Badge,
} from '@fluentui/react-components';
import { Add24Regular, Person24Regular } from '@fluentui/react-icons';
import { iconMap } from '../data/icons';
import type { Persona } from '../types';

const useStyles = makeStyles({
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  stepBadge: {
    flexShrink: 0,
  },
  description: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalL,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    padding: tokens.spacingVerticalM,
    position: 'relative' as const,
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
    '&:hover': {
      boxShadow: tokens.shadow8,
    },
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  cardIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
    marginTop: '2px',
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase300,
    flex: 1,
  },
  bulletList: {
    listStyleType: 'disc',
    paddingLeft: tokens.spacingHorizontalL,
    margin: `${tokens.spacingVerticalXS} 0 ${tokens.spacingVerticalM}`,
    '& li': {
      fontSize: tokens.fontSizeBase200,
      color: tokens.colorNeutralForeground2,
      marginBottom: tokens.spacingVerticalXXS,
    },
  },
  addButton: {
    width: '100%',
  },
});

interface PersonaSelectorProps {
  personas: Persona[];
  onAddPersona: (personaId: string) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  onAddPersona,
}) => {
  const styles = useStyles();

  return (
    <div>
      <div className={styles.sectionHeader}>
        <Badge className={styles.stepBadge} appearance="filled" color="brand" shape="circular" size="large">1</Badge>
        <Text size={400} weight="semibold">SELECT PERSONA</Text>
      </div>
      <Text className={styles.description} block>
        Choose a persona to add to your estimate. You can add the same persona multiple times with different settings.
      </Text>
      <div className={styles.grid}>
        {personas.map((persona) => (
          <Card
            key={persona.id}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>
                {iconMap[persona.icon] ?? <Person24Regular />}
              </span>
              <Text className={styles.cardTitle}>{persona.name}</Text>
            </div>
            <ul className={styles.bulletList}>
              {persona.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <Button
              className={styles.addButton}
              appearance="primary"
              icon={<Add24Regular />}
              onClick={() => onAddPersona(persona.id)}
              size="small"
            >
              Add to Estimate
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
