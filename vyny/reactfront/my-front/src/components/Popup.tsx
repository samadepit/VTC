import React from 'react';

const Popup = ({ isOpen, onClose, onConfirm, userData }) => {
    if (!isOpen) return null;
    const fullName = userData ? `${userData.nom} ${userData.prenom}` : '';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-full max-w-sm relative">
                <div>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                    <h2 className="text-xl font-bold mb-4">Confirmation</h2>
                    <p className="mb-6">Êtes-vous sûr de vouloir continuer au nom de {fullName} ?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onConfirm}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                            OK
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Popup;