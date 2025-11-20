import React from 'react';
import { SchemaPage } from '@/components/SchemaPage';
import { productSchema } from './schema';

const QuickDevDemo: React.FC = () => {
    return <SchemaPage schema={productSchema} />;
};

export default QuickDevDemo;
