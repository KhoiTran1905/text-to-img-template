import { getLayoutConfig } from './actions';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic'; // Ensure we always get fresh config

export default async function Page() {
  const config = await getLayoutConfig();
  return <HomeClient config={config} />;
}
