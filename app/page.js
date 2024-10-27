'use client';

import React, { useState, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Container,
  Fab,
  IconButton,
  LinearProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tab,
  Tabs,
  Alert,
  Menu,
  MenuItem,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Paper,
  Tooltip,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Favorite as GoodHabitIcon,
  Block as BadHabitIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as StreakIcon,
  EmojiEvents as TrophyIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [newHabit, setNewHabit] = useState({ name: '', type: 'good' });
  const [currentTab, setCurrentTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedHabitForAI, setSelectedHabitForAI] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    streakReset: true,
  });

  const theme = createTheme({
    palette: {
      mode: settings.darkMode ? 'dark' : 'light',
      primary: {
        main: '#6366f1',
      },
      secondary: {
        main: '#ec4899',
      },
      background: {
        default: settings.darkMode ? '#0f172a' : '#f8fafc',
        paper: settings.darkMode ? '#1e293b' : '#ffffff'
      },
      success: {
        main: '#22c55e',
        light: alpha('#22c55e', 0.1),
      },
      error: {
        main: '#ef4444',
        light: alpha('#ef4444', 0.1),
      }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }
        }
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          }
        }
      }
    }
  });

  const [habits, setHabits] = useState({
    good: [
      { id: 1, name: 'Daily Exercise', streak: 0, completed: false, lastCompletedDate: null },
      { id: 2, name: 'Read 30 mins', streak: 0, completed: false, lastCompletedDate: null },
    ],
    bad: [
      { id: 3, name: 'Smoking', streak: 0, avoided: false, lastCompletedDate: null },
      { id: 4, name: 'Late Night Snacking', streak: 0, avoided: false, lastCompletedDate: null },
    ]
  });

  const getAIRecommendations = async (habitName) => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: `Please provide recommendations for breaking the bad habit of ${habitName}`,
      });
      
      const data = await response.json();
      
      if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      } else {
        setAiRecommendations([{
          title: "No Recommendations Available",
          description: "Unable to generate recommendations at this time. Please try again later."
        }]);
      }
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      setAiRecommendations([{
        title: "Error Loading Recommendations",
        description: "Unable to load recommendations at this time. Please try again later."
      }]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const goodProgress = habits.good.length > 0 
    ? Math.round((habits.good.filter(h => h.completed).length / habits.good.length) * 100)
    : 0;
  
  const badProgress = habits.bad.length > 0
    ? Math.round((habits.bad.filter(h => h.avoided).length / habits.bad.length) * 100)
    : 0;

  const handleOpenMenu = (event, habitId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedHabitId(habitId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedHabitId(null);
  };

  const handleDeleteHabit = () => {
    const habitType = currentTab === 0 ? 'good' : 'bad';
    setHabits(prev => ({
      ...prev,
      [habitType]: prev[habitType].filter(habit => habit.id !== selectedHabitId)
    }));
    handleCloseMenu();
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleUndoCompletion = (type) => {
    setHabits(prev => ({
      ...prev,
      [type]: prev[type].map(habit =>
        habit.id === selectedHabitId
          ? {
              ...habit,
              [type === 'good' ? 'completed' : 'avoided']: false,
              lastCompletedDate: null,
              streak: 0
            }
          : habit
      )
    }));
    handleCloseMenu();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setDialogError('');
    setNewHabit({ name: '', type: 'good' });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogError('');
  };

  const handleAddHabit = () => {
    if (newHabit.name.trim() === '') {
      setDialogError('Please enter a habit name');
      return;
    }

    const newId = Math.max(...[...habits.good, ...habits.bad].map(h => h.id), 0) + 1;
    
    setHabits(prev => ({
      ...prev,
      [newHabit.type]: [
        ...prev[newHabit.type],
        {
          id: newId,
          name: newHabit.name.trim(),
          streak: 0,
          [newHabit.type === 'good' ? 'completed' : 'avoided']: false,
          lastCompletedDate: null
        }
      ]
    }));

    handleCloseDialog();
  };

  const toggleHabit = (id, type) => {
    const today = new Date().toDateString();
    
    setHabits(prev => ({
      ...prev,
      [type]: prev[type].map(habit => {
        if (habit.id !== id) return habit;
        
        const isCompleted = type === 'good' ? habit.completed : habit.avoided;
        const lastCompletedDate = habit.lastCompletedDate;
        
        if (!isCompleted) {
          const isYesterday = (date) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toDateString() === date;
          };

          const newStreak = !lastCompletedDate ? 1 :
                           isYesterday(lastCompletedDate) ? habit.streak + 1 :
                           1;

          return {
            ...habit,
            [type === 'good' ? 'completed' : 'avoided']: true,
            lastCompletedDate: today,
            streak: newStreak
          };
        }
        
        return {
          ...habit,
          [type === 'good' ? 'completed' : 'avoided']: false
        };
      })
    }));
  };

  const StreakBadge = ({ streak }) => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '0.875rem',
        fontWeight: 'medium',
      }}
    >
      <StreakIcon sx={{ fontSize: 16, mr: 0.5 }} />
      {streak} days
    </Box>
  );

  const ProgressRing = ({ value, size = 40, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            stroke={theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.1)}
            fill="none"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={theme.palette.primary.main}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.5s'
            }}
          />
        </svg>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontWeight: 'bold'
          }}
        >
          {value}%
        </Typography>
      </Box>
    );
  };

  useEffect(() => {
    if (!settings.streakReset) return;

    const checkStreaks = () => {
      const today = new Date().toDateString();
      
      setHabits(prev => ({
        good: prev.good.map(habit => ({
          ...habit,
          completed: false,
          streak: habit.lastCompletedDate && isYesterday(habit.lastCompletedDate) ? habit.streak : 0
        })),
        bad: prev.bad.map(habit => ({
          ...habit,
          avoided: false,
          streak: habit.lastCompletedDate && isYesterday(habit.lastCompletedDate) ? habit.streak : 0
        }))
      }));
    };

    const isYesterday = (dateString) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toDateString() === dateString;
    };

    checkStreaks();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    const timeout = setTimeout(checkStreaks, timeUntilMidnight);
    return () => clearTimeout(timeout);
  }, [settings.streakReset]);

  useEffect(() => {
    if (!settings.notifications) return;

    const checkNotifications = () => {
      if (Notification.permission === "granted") {
        const uncompletedGood = habits.good.filter(h => !h.completed);
        const unavoidedBad = habits.bad.filter(h => !h.avoided);

        if (uncompletedGood.length > 0 || unavoidedBad.length > 0) {
          new Notification("Habit Tracker Reminder", {
            body: "You have uncompleted habits for today!"
          });
        }
      }
    };

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const notificationInterval = setInterval(checkNotifications, 3600000);
    return () => clearInterval(notificationInterval);
  }, [settings.notifications, habits]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
              <Typography 
                variant="h5" 
                component="h1"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                Habit Tracker
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ProgressRing value={Math.round((goodProgress + badProgress) / 2)} />
                <IconButton 
                  onClick={handleOpenSettings}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <SettingsIcon color="primary" />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </AppBar>

        <Box sx={{ height: 72 }} />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            pb: 10,
            '::-webkit-scrollbar': {
              width: '8px',
            },
            '::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '4px',
            },
            '::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.primary.main, 0.3),
            },
          }}
        >
          <Container sx={{ pt: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Card 
                elevation={0}
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <TrophyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Today's Progress
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', fontWeight: 'medium' }}>
                      <GoodHabitIcon sx={{ mr: 1, color: 'success.main' }} />
                      Good Habits
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={goodProgress} 
                      color="success"
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        '.MuiLinearProgress-bar': {
                          borderRadius: 5,
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {habits.good.filter(h => h.completed).length} of {habits.good.length} completed
                      </Typography>
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        {goodProgress}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', fontWeight: 'medium' }}>
                      <BadHabitIcon sx={{ mr: 1, color: 'error.main' }} />
                      Bad Habits Avoided
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={badProgress} 
                      color="error"
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        '.MuiLinearProgress-bar': {
                          borderRadius: 5,
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {habits.bad.filter(h => h.avoided).length} of {habits.bad.length} avoided
                      </Typography>
                      <Typography variant="caption" color="error.main" fontWeight="bold">
                        {badProgress}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ 
              position: 'sticky', 
              top: 72,
              zIndex: 1,
              py: 1,
              backgroundColor: theme.palette.background.default
            }}>
              <Tabs 
                value={currentTab} 
                onChange={(_, newValue) => setCurrentTab(newValue)}
                sx={{ 
                  mb: 2,
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                  '& .MuiTab-root': {
                    minHeight: 48,
                    fontWeight: 'medium',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                    }
                  }
                }}
              >
                <Tab 
                  icon={<GoodHabitIcon sx={{ fontSize: 20 }} />} 
                  label="Good Habits" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<BadHabitIcon sx={{ fontSize: 20 }} />} 
                  label="Bad Habits" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ mb: 4 }}>
              {currentTab === 0 && (
                <Box sx={{ mb: 4 }}>
                  {habits.good.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      color: 'text.secondary',
                      background: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                    }}>
                      <Typography variant="h6">No good habits added yet</Typography>
                      <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
                        Start tracking your positive habits by adding one below
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        color="primary"
                      >
                        Add Your First Habit
                      </Button>
                    </Box>
                  ) : (
                    habits.good.map(habit => (
                      <Zoom in key={habit.id} style={{ transitionDelay: '100ms' }}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            mb: 2, 
                            bgcolor: habit.completed ? alpha(theme.palette.success.main, 0.05) : 'background.paper',
                            border: `1px solid ${habit.completed ? theme.palette.success.main : alpha(theme.palette.divider, 0.1)}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="h6" sx={{ mb: 1 }}>{habit.name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <StreakBadge streak={habit.streak} />
                                  {habit.lastCompletedDate && (
                                    <Typography variant="caption" color="text.secondary">
                                      Last: {new Date(habit.lastCompletedDate).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={habit.completed ? "Mark Incomplete" : "Mark Complete"}>
                                  <IconButton
                                    onClick={() => toggleHabit(habit.id, 'good')}
                                    sx={{
                                      bgcolor: habit.completed ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                                      '&:hover': {
                                        bgcolor: habit.completed ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.primary.main, 0.1),
                                      }
                                    }}
                                  >
                                    <CheckCircleIcon 
                                      sx={{ 
                                        color: habit.completed ? theme.palette.success.main : alpha(theme.palette.text.primary, 0.2),
                                        transition: 'color 0.2s'
                                      }} 
                                    />
                                  </IconButton>
                                </Tooltip>
                                <IconButton
                                  onClick={(e) => handleOpenMenu(e, habit.id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    }
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            {habit.streak >= 7 && (
                              <Box sx={{ 
                                mt: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              }}>
                                <CelebrationIcon color="primary" />
                                <Typography variant="body2" color="primary.main">
                                  Amazing streak! {habit.streak} days and counting!
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Zoom>
                    ))
                  )}
                </Box>
              )}

              {currentTab === 1 && (
                <Box sx={{ mb: 4 }}>
                  {habits.bad.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      color: 'text.secondary',
                      background: alpha(theme.palette.error.main, 0.05),
                      borderRadius: 2,
                    }}>
                      <Typography variant="h6">No bad habits tracked yet</Typography>
                      <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
                        Start tracking habits you want to break
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        color="error"
                      >
                        Add Bad Habit to Break
                      </Button>
                    </Box>
                  ) : (
                    habits.bad.map(habit => (
                      <Zoom in key={habit.id} style={{ transitionDelay: '100ms' }}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            mb: 2, 
                            bgcolor: habit.avoided ? alpha(theme.palette.error.main, 0.05) : 'background.paper',
                            border: `1px solid ${habit.avoided ? theme.palette.error.main : alpha(theme.palette.divider, 0.1)}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.15)}`,
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="h6" sx={{ mb: 1 }}>{habit.name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <StreakBadge streak={habit.streak} />
                                  {habit.lastCompletedDate && (
                                    <Typography variant="caption" color="text.secondary">
                                      Last avoided: {new Date(habit.lastCompletedDate).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={habit.avoided ? "Mark Failed" : "Mark Avoided"}>
                                  <IconButton
                                    onClick={() => toggleHabit(habit.id, 'bad')}
                                    sx={{
                                      bgcolor: habit.avoided ? alpha(theme.palette.error.main, 0.1) : 'transparent',
                                      '&:hover': {
                                        bgcolor: habit.avoided ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.error.main, 0.1),
                                      }
                                    }}
                                  >
                                    <CancelIcon 
                                      sx={{ 
                                        color: habit.avoided ? theme.palette.error.main : alpha(theme.palette.text.primary, 0.2),
                                        transition: 'color 0.2s'
                                      }} 
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Get AI Tips">
                                  <IconButton
                                    onClick={() => {
                                      setSelectedHabitForAI(habit);
                                      setAiDialogOpen(true);
                                      getAIRecommendations(habit.name);
                                    }}
                                    sx={{
                                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                                      }
                                    }}
                                  >
                                    <LightbulbIcon sx={{ color: theme.palette.warning.main }} />
                                  </IconButton>
                                </Tooltip>
                                <IconButton
                                  onClick={(e) => handleOpenMenu(e, habit.id)}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    }
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Zoom>
                    ))
                  )}
                </Box>
              )}
            </Box>
          </Container>
        </Box>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200
            }
          }}
        >
          <MenuItem 
            onClick={() => handleUndoCompletion(currentTab === 0 ? 'good' : 'bad')}
            sx={{ 
              color: 'error.main',
              gap: 1,
              py: 1.5
            }}
          >
            <Cancel sx={{ fontSize: 20 }} />
            Remove Today's Entry
          </MenuItem>
          <MenuItem 
            onClick={handleDeleteHabit}
            sx={{ 
              color: 'error.main',
              gap: 1,
              py: 1.5
            }}
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
            Delete Habit
          </MenuItem>
        </Menu>

        <Dialog 
          open={settingsOpen} 
          onClose={handleCloseSettings}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 24,
            sx: {
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <SettingsIcon color="primary" />
            Settings
          </DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Enable dark theme for the application"
                  primaryTypographyProps={{
                    fontWeight: 'medium'
                  }}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.darkMode}
                    onChange={handleSettingChange('darkMode')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Receive daily reminders for your habits"
                  primaryTypographyProps={{
                    fontWeight: 'medium'
                  }}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.notifications}
                    onChange={handleSettingChange('notifications')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Automatic Streak Reset" 
                  secondary="Reset streaks automatically at midnight"
                  primaryTypographyProps={{
                    fontWeight: 'medium'
                  }}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.streakReset}
                    onChange={handleSettingChange('streakReset')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCloseSettings} 
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 24,
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <AddIcon color="primary" />
            Add New Habit
          </DialogTitle>
          <DialogContent>
            {dialogError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2
                }}
              >
                {dialogError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Habit Name"
              fullWidth
              value={newHabit.name}
              onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <RadioGroup
              value={newHabit.type}
              onChange={(e) => setNewHabit(prev => ({ ...prev, type: e.target.value }))}
            >
              <FormControlLabel 
                value="good" 
                control={<Radio color="success" />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GoodHabitIcon sx={{ color: 'success.main' }} />
                    Good Habit
                  </Box>
                }
              />
              <FormControlLabel 
                value="bad" 
                control={<Radio color="error" />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadHabitIcon sx={{ color: 'error.main' }} />
                    Bad Habit
                  </Box>
                }
              />
            </RadioGroup>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddHabit} 
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Add Habit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={aiDialogOpen} 
          onClose={() => {
            setAiDialogOpen(false);
            setSelectedHabitForAI(null);
            setAiRecommendations(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 24,
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <LightbulbIcon sx={{ color: 'warning.main' }} />
            AI Recommendations
          </DialogTitle>
          <DialogContent>
            {loadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : aiRecommendations ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  Breaking the habit: {selectedHabitForAI?.name}
                </Typography>
                {aiRecommendations.map((rec, index) => (
                  <Card 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      mb: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                        {rec.title}
                      </Typography>
                      <Typography variant="body2">
                        {rec.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography>Loading recommendations...</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button 
              onClick={() => {
                setAiDialogOpen(false);
                setSelectedHabitForAI(null);
                setAiRecommendations(null);
              }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
            <Button 
              onClick={() => getAIRecommendations(selectedHabitForAI?.name)}
              disabled={loadingRecommendations}
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Get New Tips
            </Button>
          </DialogActions>
        </Dialog>

        <Fab 
          color="primary" 
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            borderRadius: 3,
          }}
          onClick={handleOpenDialog}
        >
          <AddIcon />
        </Fab>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;