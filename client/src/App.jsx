import { CssBaseline, Container, Typography, Box } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Banking Operations System
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            React + Vite · MUI · Redux Toolkit · ASP.NET Core 8 · SQLite
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default App;
