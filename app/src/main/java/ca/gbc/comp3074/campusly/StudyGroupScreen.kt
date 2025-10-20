@file:OptIn(ExperimentalMaterial3Api::class)

package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class StudyGroup(val name: String, val description: String)

@Composable
fun StudyGroupsScreen(
    onBack: () -> Unit
) {
    var groups by remember {
        mutableStateOf(
            listOf(
                StudyGroup("Math 101 Group", "Weekly math problem-solving sessions."),
                StudyGroup("Physics Buddies", "Study for tests together."),
                StudyGroup("Comp3074 Project Group", "Collaborate on project work.")
            )
        )
    }
    var joinedGroups by remember { mutableStateOf(setOf<String>()) }
    var newGroupName by remember { mutableStateOf("") }
    var newGroupDescription by remember { mutableStateOf("") }
    var searchQuery by remember { mutableStateOf("") }

    val filteredGroups = if (searchQuery.isBlank()) groups else {
        groups.filter { it.name.contains(searchQuery, ignoreCase = true) }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        TopAppBar(
            title = { Text("Study Groups") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            }
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            label = { Text("Search Groups") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(modifier = Modifier.weight(1f)) {
            items(filteredGroups) { group ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(group.name, style = MaterialTheme.typography.titleMedium)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(group.description, style = MaterialTheme.typography.bodyMedium)
                        }
                        Button(
                            onClick = {
                                joinedGroups = if (joinedGroups.contains(group.name)) {
                                    joinedGroups - group.name
                                } else {
                                    joinedGroups + group.name
                                }
                            }
                        ) {
                            Text(if (joinedGroups.contains(group.name)) "Leave" else "Join")
                        }
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))

        if (joinedGroups.isNotEmpty()) {
            Text("Joined Groups:", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            for (groupName in joinedGroups) {
                Text("- $groupName", style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        Text("Add New Study Group", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(
            value = newGroupName,
            onValueChange = { newGroupName = it },
            label = { Text("Group Name") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = newGroupDescription,
            onValueChange = { newGroupDescription = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = {
                if (newGroupName.isNotBlank() && newGroupDescription.isNotBlank()) {
                    groups = groups + StudyGroup(newGroupName, newGroupDescription)
                    newGroupName = ""
                    newGroupDescription = ""
                }
            },
            modifier = Modifier.align(Alignment.End)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add Group")
            Spacer(modifier = Modifier.width(4.dp))
            Text("Add")
        }
    }
}
