import { render } from 'react-dom';
import { suspend } from 'suspend-react';
import { BrowserRouter, Redirect } from 'react-router-dom';
import {
  CompatRouter,
  CompatRoute,
  Routes,
  Route,
  Link,
  useLocation,
  matchPath,
} from 'react-router-dom-v5-compat';
import {
  Tabs,
  Tab,
  Container,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import React, { Suspense } from 'react';

render(
  <Suspense fallback={<Loading />}>
    <BrowserRouter>
      <CompatRouter>
        <CompatRoute path="" render={() => <Layout />} />
        <Redirect to="/foo" />
      </CompatRouter>
    </BrowserRouter>
  </Suspense>,
  document.getElementById('root')!
);

function Layout() {
  const { pathname } = useLocation();
  const tab = matchPath('/:tab/*', pathname)?.params.tab ?? 'foo';
  return (
    <Container>
      <Stack gap={2}>
        <Tabs value={tab}>
          <Tab value="foo" label="Foo" component={Link} to="/foo" />
          <Tab value="bar" label="Bar" component={Link} to="/bar" />
          <Tab value="shazbot" label="ShazBot" component={Link} to="/shazbot" />
        </Tabs>
        {/*
        TL;DR: When you see the error 'MUI: The `value` provided to the Tabs
        component is invalid.' that means you're missing a Suspense boundary
        *below* the <Tabs /> component, or at the very least you need one
        wrapping the tab content, however that's implemented.

        With this suspense boundary commented out, when the TabPanel
        suspends on initial render, MUI will complain that the Tab with the
        value "foo" isn't part of the document layout, which is true since the
        parent Suspense boundary is rendering the fallback and the ref now
        points to a non-existent DOM node and has no client rect. (See
        https://github.com/mui/material-ui/blob/2093d62046a1fd1342d0e5e6ef7f156faf778b52/packages/mui-material/src/Tabs/Tabs.js#L361-L362)
        
        Uncomment the following suspense boundary to handle the error (and also
        gives a bit nicer UX imo).
        */}

        {/* <Suspense
          fallback={
            <Container>
              <CircularProgress />
            </Container>
          }
        > */}
        <Routes>
          <Route path="/foo" element={<TabPanel>Foo</TabPanel>} />
          <Route path="/bar" element={<TabPanel>Bar</TabPanel>} />
          <Route path="/shazbot" element={<TabPanel>Shazbot</TabPanel>} />
        </Routes>
        {/* </Suspense> */}
      </Stack>
    </Container>
  );
}

function TabPanel({ children }: { children: React.ReactNode }) {
  suspend(async () => new Promise((r) => setTimeout(r, 500)), [], {
    lifespan: 1,
  });
  return <Typography variant="h1">{children}</Typography>;
}

function Loading() {
  return (
    <Container>
      <Stack>
        <CircularProgress />
      </Stack>
    </Container>
  );
}
