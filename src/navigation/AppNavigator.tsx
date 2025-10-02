import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types";

// Import screens
import NoteListScreen from "../screens/NoteListScreen";
import NoteEditorScreen from "../screens/NoteEditorScreen";
import NoteViewScreen from "../screens/NoteViewScreen";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='NoteList'
        screenOptions={{
          headerStyle: {
            backgroundColor: "#6366f1",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name='NoteList'
          component={NoteListScreen}
          options={{
            title: "My Notes",
            headerRight: () => null, // We'll add the "Add Note" button later
          }}
        />
        <Stack.Screen
          name='NoteEditor'
          component={NoteEditorScreen}
          options={({ route }) => ({
            title: route.params?.noteId ? "Edit Note" : "New Note",
          })}
        />
        <Stack.Screen
          name='NoteView'
          component={NoteViewScreen}
          options={{
            title: "Note Details",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
