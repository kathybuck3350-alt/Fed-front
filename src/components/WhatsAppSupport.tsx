import React from 'react';
import { MessageCircle } from 'lucide-react';


export const WhatsAppSupport = () => {

    const phoneNumber = "+160134773300"
    const message = 'Hi, I need help reporting a scam.'
    const handleClick = () => {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/14693266824`, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            title="Chat with WhatsApp Support"
        >
            <MessageCircle className="w-7 h-7" />
        </button>
    );
};
