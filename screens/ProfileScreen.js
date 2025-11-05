

import React, { useState } from 'react';
import { Page, UserProfile, Gender, ActivityLevel, PrimaryGoal, UnitSystem } from '../types.js';
import { BackIcon } from '../components/Icons.js';
import { useAppContext } from '../contexts/AppContext.js';
import { cmToInches, getDisplayHeightCm, getDisplayHeightFt, getDisplayHeightIn, inchesToCm } from '../utils/units.js';

const avatars = ['🧑‍🦰', '👩‍🦳', '👨‍🚀', '🦸‍♀️', '🧘‍♂️', '🎨', '🎸', '⚽️'];

const UnitSelector = ({ selected, onSelect }) => {
    const { triggerHapticFeedback } = useAppContext();
    return (
        React.createElement("div", { className: "flex p-1 bg-gray-200 dark:bg-dark-border rounded-full" },
            React.createElement("button", {
                onClick: () => { triggerHapticFeedback(); onSelect(UnitSystem.Imperial); },
                className: `w-1/2 py-2 rounded-full font-semibold transition-colors transition-transform active:scale-95 ${selected === UnitSystem.Imperial ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`
            },
                "Imperial (lbs, ft)"
            ),
            React.createElement("button", {
                onClick: () => { triggerHapticFeedback(); onSelect(UnitSystem.Metric); },
                className: `w-1/2 py-2 rounded-full font-semibold transition-colors transition-transform active:scale-95 ${selected === UnitSystem.Metric ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`
            },
                "Metric (kg, cm)"
            )
        )
    );
};


const ProfileScreen = () => {
    const { navigateTo, profile: currentProfile, handleProfileUpdate: onSave, triggerHapticFeedback } = useAppContext();
    const [profile, setProfile] = useState(currentProfile);

    const handleSave = () => {
        triggerHapticFeedback();
        onSave(profile);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handleHeightChange = (part, value) => {
        const numericValue = parseInt(value) || 0;
        const currentFeet = Math.floor(profile.height / 12);
        const currentInches = profile.height % 12;
        let newTotalInches;
        if (part === 'feet') {
            newTotalInches = numericValue * 12 + currentInches;
        } else {
            newTotalInches = currentFeet * 12 + numericValue;
        }
        setProfile(p => ({ ...p, height: newTotalInches }));
    };

    return (
        React.createElement("div", { className: "p-4 flex flex-col h-full bg-background dark:bg-dark-background" },
            React.createElement("header", { className: "flex items-center mb-6" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.Settings); }, className: "p-2 -ml-2 transition-transform active:scale-95" },
                    React.createElement(BackIcon, { className: "w-6 h-6 text-text-main dark:text-dark-text-main" })
                ),
                React.createElement("h1", { className: "text-xl font-bold text-text-main dark:text-dark-text-main mx-auto font-montserrat" }, "Edit Profile"),
                React.createElement("div", { className: "w-6" })
            ),

            React.createElement("div", { className: "flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-6" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Avatar"),
                    React.createElement("div", { className: "flex flex-col items-center" },
                        React.createElement("div", { className: "w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-4 text-5xl" },
                            profile.avatar
                        ),
                        React.createElement("div", { className: "grid grid-cols-4 gap-4" },
                            avatars.map(avatar => (
                                React.createElement("button", {
                                    key: avatar,
                                    onClick: () => { triggerHapticFeedback(); setProfile(p => ({ ...p, avatar })); },
                                    className: `w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${profile.avatar === avatar ? 'bg-primary-light ring-2 ring-primary' : 'bg-light-gray dark:bg-dark-border'}`
                                },
                                    avatar
                                )
                            ))
                        )
                    )
                ),

                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "name", className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Name"),
                    React.createElement("input", { id: "name", name: "name", type: "text", value: profile.name, onChange: handleInputChange, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" })
                ),
                
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "age", className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Age"),
                        React.createElement("input", { id: "age", name: "age", type: "number", value: profile.age, onChange: handleInputChange, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" })
                    ),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "gender", className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Gender"),
                        React.createElement("select", { id: "gender", name: "gender", value: profile.gender, onChange: handleSelectChange, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" },
                            Object.values(Gender).map(g => React.createElement("option", { key: g, value: g }, g))
                        )
                    )
                ),
                
                 React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Unit System"),
                    React.createElement(UnitSelector, { selected: profile.unitSystem, onSelect: (system) => setProfile(p => ({ ...p, unitSystem: system })) })
                ),

                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Height"),
                    profile.unitSystem === UnitSystem.Metric ? (
                        React.createElement("div", { className: "relative" },
                            React.createElement("input", { type: "number", value: getDisplayHeightCm(profile.height), onChange: e => setProfile(p => ({...p, height: cmToInches(parseInt(e.target.value) || 0)})), className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none pr-12" }),
                            React.createElement("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-light" }, "cm")
                        )
                    ) : (
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "number", value: getDisplayHeightFt(profile.height), onChange: e => handleHeightChange('feet', e.target.value), className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none", placeholder: "ft" }),
                            React.createElement("input", { type: "number", value: getDisplayHeightIn(profile.height), onChange: e => handleHeightChange('inches', e.target.value), className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none", placeholder: "in" })
                        )
                    )
                ),
                
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "activityLevel", className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Activity Level"),
                    React.createElement("select", { id: "activityLevel", name: "activityLevel", value: profile.activityLevel, onChange: handleSelectChange, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" },
                        Object.values(ActivityLevel).map(level => React.createElement("option", { key: level, value: level }, level))
                    )
                ),
                
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "primaryGoal", className: "block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2 font-montserrat" }, "Primary Goal"),
                    React.createElement("select", { id: "primaryGoal", name: "primaryGoal", value: profile.primaryGoal, onChange: handleSelectChange, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" },
                        Object.values(PrimaryGoal).map(goal => React.createElement("option", { key: goal, value: goal }, goal))
                    )
                )
            ),

            React.createElement("div", { className: "mt-6" },
                React.createElement("button", { onClick: handleSave, className: "w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors transition-transform active:scale-95" },
                    "Save Changes"
                )
            )
        )
    );
};

export default ProfileScreen;