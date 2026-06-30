import React from 'react';
import {
  Tab,
  TabList,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { ToolId } from '../types';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: tokens.spacingVerticalL,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    marginBottom: tokens.spacingVerticalXXL,
  },
  toolIcon: {
    width: '24px',
    height: '24px',
    objectFit: 'contain' as const,
  },
});

export interface ProductItem {
  id: string;
  name: string;
  imageUrl?: string;
  sortOrder?: number;
  complexityTooltip?: string;
}

interface ToolSelectorProps {
  activeToolId: ToolId;
  products: ProductItem[];
  onToolChange: (toolId: ToolId) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  activeToolId,
  products,
  onToolChange,
}) => {
  const styles = useStyles();
  const sorted = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return (
    <div className={styles.root}>
      <TabList
        selectedValue={activeToolId}
        onTabSelect={(_, data) => onToolChange(data.value as ToolId)}
        size="large"
      >
        {sorted.map((product) => (
          <Tab
            key={product.id}
            value={product.id}
            icon={product.imageUrl ? <img src={product.imageUrl} alt={product.name} className={styles.toolIcon} /> : undefined}
          >
            {product.name}
          </Tab>
        ))}
      </TabList>
    </div>
  );
};
