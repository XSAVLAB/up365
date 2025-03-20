// components/EntityFixtureWidget.js
'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        Entity_sport: {
            field: string;
            widget_type: string;
            widget: string;
            id: number;
            code: string;
            where_to: string;
        };
    }
}

const EntityFixtureWidget = () => {
    useEffect(() => {
        // Define the widget properties
        window.Entity_sport = {
            field: 'entity_cricket', // Specify the sport type
            widget_type: 'content_type', // Define the widget type
            widget: 'fixtures', // Name of the widget
            id: 12345, // Relevant ID (e.g., competition_id)
            code: '4654436544', // Standard code
            where_to: 'entity-widget-container', // ID of the container
        };

        // Dynamically load the widget loader script
        const script = document.createElement('script');
        script.src = 'https://widgets.entitysport.com/widget-loader.js';
        script.defer = true;
        document.body.appendChild(script);

        // Cleanup function to remove the script when the component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return <div id="entity-widget-container"></div>;
};

export default EntityFixtureWidget;
