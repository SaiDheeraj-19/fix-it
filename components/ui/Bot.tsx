import React from 'react';
import { Bot as LucideBot, LucideProps } from 'lucide-react';

// Simple utility since lib/utils is missing
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface BotProps extends LucideProps {
    animateOnHover?: boolean;
}

export const Bot: React.FC<BotProps> = ({ animateOnHover = false, className, ...props }) => {
    return (
        <div className={cn("relative inline-flex items-center justify-center group", className)}>
            <LucideBot
                className={cn(
                    "transition-all duration-300",
                    animateOnHover && "group-hover:text-primary group-hover:rotate-12 group-hover:scale-110"
                )}
                {...props}
            />
            {animateOnHover && (
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
            )}
        </div>
    );
};
