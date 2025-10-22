package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// Brand colors
val blueStart = Color(0xFF2152FF)
val blueEnd = Color(0xFF0B2DCC)
val dotGrey = Color(0x66FFFFFF)
val dotWhite = Color(0xFFFFFFFF)
val accentYellow = Color(0xFFFFC542)
val accentGreen = Color(0xFF388E3C)
val accentRed = Color(0xFFA61515)

data class StudyGroup(val name: String, val description: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyGroupsScreen(
    viewModel: StudyGroupViewModel,
    onBack: () -> Unit,
    onGoHome: () -> Unit
) {
    val groups by viewModel.allGroups.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val filteredGroups = if (searchQuery.isBlank()) groups else {
        groups.filter { it.name.contains(searchQuery, ignoreCase = true) }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Study Groups") },
                navigationIcon = {
                    IconButton(onClick = onGoHome) {
                        Icon(Icons.Default.Home, contentDescription = "Go to Home", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = blueStart,
                    navigationIconContentColor = Color.White,
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {

            // Group List
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(filteredGroups) { group ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = dotWhite
                        ),
                        elevation = CardDefaults.cardElevation(6.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    group.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = blueEnd
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    group.description,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color.Black
                                )
                            }
                            val isJoined = viewModel.joinedGroups.contains(group.name)
                            Button(
                                onClick = { viewModel.toggleJoinGroup(group.name) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isJoined) accentRed else accentGreen,
                                    contentColor = Color.White
                                )
                            ) {
                                Text(if (isJoined) "Leave" else "Join")
                            }
                        }
                    }
                }
            }

            // Joined Groups List
            if (viewModel.joinedGroups.isNotEmpty()) {
                Text("Joined Groups:", style = MaterialTheme.typography.titleMedium, color = blueEnd)
                Spacer(modifier = Modifier.height(8.dp))
                val groupList: List<String> = viewModel.joinedGroups.toList()
                for (groupName in groupList) {
                    Text("- $groupName", style = MaterialTheme.typography.bodyMedium, color = Color.Black)
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Add Group Form
            var newGroupName by remember { mutableStateOf("") }
            var newGroupDescription by remember { mutableStateOf("") }

            Text("Add New Study Group", style = MaterialTheme.typography.titleMedium, color = blueStart)
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
                        viewModel.addStudyGroup(newGroupName, newGroupDescription)
                        newGroupName = ""
                        newGroupDescription = ""
                    }
                },
                modifier = Modifier.align(Alignment.End),
                colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Group")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add")
            }
        }
    }
}
