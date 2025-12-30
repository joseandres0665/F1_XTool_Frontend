/* eslint-disable react/button-has-type */
import { useHistory, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Keyboard from 'simple-keyboard';
import arabicLayout from 'simple-keyboard-layouts/build/layouts/arabic';
import englishLayout from 'simple-keyboard-layouts/build/layouts/english';
import 'simple-keyboard/build/css/index.css';
import BackImage from '../../../assets/back/back_2_1.svg';
import './style.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default function PersonalizationPage() {
  const history = useHistory();
  const query = useQuery();
  const firstText = query.get('first_text'); // e.g. ?name=John

  const keyboardRef = useRef<Keyboard | null>(null);
  const keyboardContainerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState('');
  const [layoutName, setLayoutName] = useState<'arabic' | 'english'>('arabic');
  const [warningMessage, setWarningMessage] = useState<string>('');

  const handleEnterKey = useCallback(
    async (value: string) => {
      try {
        // Clear previous warning
        setWarningMessage('');

        // Call the check endpoint
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/check`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: value }),
          }
        );

        const data = await response.json();

        if (data.valid === true) {
          // Valid name, proceed with navigation
          if (firstText !== null && firstText !== undefined)
            history.push(
              `/processing?first_text=${firstText}&second_text=${value}`
            );
          else history.push(`/confirmmore?first_text=${value}`);
        } else {
          // Invalid name, show warning
          setWarningMessage("You can't input this name");
        }
      } catch (error) {
        console.log(error);
        setWarningMessage('Error validating name. Please try again.');
      }
    },
    [history, firstText]
  );

  useEffect(() => {
    if (!keyboardContainerRef.current) return;

    const layoutConfig = layoutName === 'arabic' ? arabicLayout : englishLayout;

    if (keyboardRef.current) {
      keyboardRef.current.setOptions({
        layout: layoutConfig.layout,
      });
    } else {
      keyboardRef.current = new Keyboard(keyboardContainerRef.current, {
        layout: layoutConfig.layout,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        onChange: (input) => setInput(input),
        // eslint-disable-next-line @typescript-eslint/no-shadow
        onKeyPress: (button) => {
          try {
            if (button === '{enter}') {
              const currentInput = keyboardRef.current?.getInput() || '';
              // Trigger the same logic as Enter key on the input
              handleEnterKey(currentInput);
            }
          } catch (error) {
            console.log(error);
          }
        },
        theme: 'hg-theme-default hg-layout-default',
      });
    }
  }, [handleEnterKey, input, layoutName]);

  const toggleLayout = () => {
    setLayoutName((prev) => (prev === 'arabic' ? 'english' : 'arabic'));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleEnterKey(input); // state is correct here
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInput(value);
    keyboardRef.current?.setInput(value);
    // Clear warning when user starts typing
    if (warningMessage) {
      setWarningMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="relative overflow-hidden"
        style={{
          height: '100vh',
          width: 'min(100vw, 56.25vh)',
        }}
      >
        <img className="w-full h-full absolute" src={BackImage} alt="back" />
        <div className="w-full relative" style={{ color: 'black' }}>
          <input
            type="text"
            id="name"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your first name"
            className="p-3 border-0 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800"
            style={{
              fontFamily: 'UnityHeadlineRegular',
              position: 'absolute',
              top: '45vh',
              width: '70%',
              left: '15%',
              fontSize: '20px',
            }}
          />
          {warningMessage && (
            <div
              className="p-3 bg-red-100 border border-red-400 text-red-700 rounded"
              style={{
                position: 'absolute',
                top: '50vh',
                width: '70%',
                left: '15%',
                fontSize: '16px',
                fontFamily: 'UnityHeadlineRegular',
                textAlign: 'center',
              }}
            >
              {warningMessage}
            </div>
          )}
          <button
            onClick={toggleLayout}
            className="p-2 bg-white text-black rounded shadow-md text-sm"
            style={{ position: 'absolute', top: '79vh', right: '2.25rem' }}
          >
            {layoutName === 'arabic'
              ? '🔤 Switch to English'
              : '🕌 Switch to Arabic'}
          </button>
          <div ref={keyboardContainerRef} className="simple-keyboard" />
        </div>
      </div>
    </div>
  );
}
