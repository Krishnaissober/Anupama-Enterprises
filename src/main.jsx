import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home.jsx';
import './styles.css';
import './campaign.css';
import './creative.css';
import './grid-composition.css';

const Catalogue = lazy(() => import('./catalogue/Catalogue.jsx'));
const BusinessPages = lazy(() => import('./business/BusinessPages.jsx'));

class PreviewBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="container section"><h1>We couldn’t load the preview.</h1><p>Please reload to try again. This preview does not send enquiries.</p><button className="button" onClick={() => location.reload()}>Reload homepage</button></main>;
    return this.props.children;
  }
}

const path=location.pathname.replace(/\/$/,'');
const businessRoute=['/our-business','/enquire'].includes(path);
function MissingPage(){React.useEffect(()=>{document.title='Page not found | ANUPAMA ENTERPRISES';document.querySelector('meta[name="description"]')?.setAttribute('content','This page is unavailable. Return to ANUPAMA ENTERPRISES or browse the catalogue.');},[]);return <main className="container section"><h1>Page not found.</h1><p>This route is unavailable.</p><div className="business-actions"><a className="button" href="/">Home</a><a className="button secondary" href="/products">Back to catalogue</a></div></main>;}
createRoot(document.getElementById('root')).render(<React.StrictMode><PreviewBoundary>{businessRoute ? <Suspense fallback={<main className="container section"><h1>Loading page…</h1></main>}><BusinessPages page={path==='/enquire'?'enquire':'business'}/></Suspense> : path==='/products'||path.startsWith('/products/') ? <Suspense fallback={<main className="container section"><h1>Loading catalogue…</h1></main>}><Catalogue /></Suspense> : path==='' ? <Home /> : <MissingPage/>}</PreviewBoundary></React.StrictMode>);

