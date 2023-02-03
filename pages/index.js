import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const maxRetries = 20;
  const [input, setInput] = useState('');
  const [img, setImg] = useState('');
  const [medium, setMedium] = useState('');
  const [vibe, setVibe] = useState('');
  const [descriptor, setDescriptor] = useState('');
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const onMediumChange = (event) => {
    setMedium(event.target.value);
  }

  const onVibeChange = (event) => {
    setVibe(event.target.value);
  }

  const onDescriptorChange = (event) => {
    setDescriptor(event.target.value);
  }

  const applyOptions = async () => {
    setInput(`portrait of dave, ${medium}, ${vibe}, ${descriptor}`);
  };

  const generateAction = async () => {
    console.log("Generating...");

    if (isGenerating && retry === 0) return;
    setIsGenerating(true);

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });
      setRetry(0);
    }
    const finalInput = input.replace(/dave/gi, 'davidebest');

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({input: finalInput}),
    });
    const data = await response.json();

    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }
    setFinalPrompt(input);
    setImg(data.image);
    setIsGenerating(false);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model loading after ${maxRetries} retries.`)
        setRetryCount(maxRetries);
        return;
      }
      console.log(`Trying again in ${retry} seconds.`);
      await sleep(retry * 1000)
      await generateAction();
    };
    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>AI Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Dave's Vanity Avatar Generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Make me look like anyone.</h2>
          </div>
        </div>
        <div className="prompt-options">
          <input className="prompt-select" onChange={onMediumChange} value={medium} list="media" placeholder="Medium"/>
          <datalist id="media">
            <option value="Comic Book"/>
            <option value="Renaisance Painting"/>
            <option value="Soviet Poster"/>
            <option value="Digital Painting"/>
          </datalist>
          <input className="prompt-select" onChange={onVibeChange} value={vibe} list="vibes" placeholder="Vibe"/>
          <datalist id="vibes">
            <option value="Science Fiction"/>
            <option value="Psychedelic Visions"/>
            <option value="Fantasy"/>
          </datalist>
          <input className="prompt-select" onChange={onDescriptorChange} value={descriptor} list="descriptors" placeholder="Descriptors"/>
          <datalist id="descriptors">
            <option value="Intricate"/>
            <option value="Colorful"/>
            <option value="Trending on Artstation"/>
          </datalist>
        </div>
        <div className="prompt-buttons">
            <a className='generate-button'
               onClick={applyOptions}
            >
              <div className="generate">
                <p>Apply</p>
              </div>
            </a>
          </div>
        <div className="prompt-container">
          <input className="prompt-box" onChange={onChange} value={input} />
          <div className="prompt-buttons">
            <a className={
                 isGenerating ? 'generate-button loading' : 'generate-button'
               }
               onClick={generateAction}
            >
              <div className="generate">
              {isGenerating ? (
                <span className="loader"></span>
              ) : (
                <p>Generate</p>
              )}
              </div>
            </a>
          </div>
        </div>
      </div>
      {img && (
        <div className="output-content">
          <Image src={img} width={512} height={512} alt={input} />
          <p>{finalPrompt}</p>
        </div>
      )}
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
