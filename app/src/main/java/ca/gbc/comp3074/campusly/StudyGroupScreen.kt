package ca.gbc.comp3074.campusly

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import android.content.Intent
import android.net.Uri

// Brand colors
val blueStart = Color(0xFF2152FF)
val blueEnd = Color(0xFF0B2DCC)
val dotGrey = Color(0x66FFFFFF)
val dotWhite = Color(0xFFFFFFFF)
val accentYellow = Color(0xFFFFC542)
val accentGreen = Color(0xFF388E3C)
val accentRed = Color(0xFFA61515)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyGroupsScreen(
    viewModel: StudyGroupViewModel,
    onBack: () -> Unit,
    onGoHome: () -> Unit,
    onOpenGroup: (id: Int, name: String) -> Unit
) {
    val groups by viewModel.allGroups.collectAsState()
    val validJoins by viewModel.validJoinedGroups.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    val ctx = LocalContext.current

    fun shareGroup(name: String, id: Int) {
        val link = "https://campusly.app/group/$id?name=" + Uri.encode(name)
        val subject = "Join the \"$name\" study group on Campusly"
        val text = "Check out \"$name\" on Campusly:\n$link"
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, text)
        }
        ctx.startActivity(Intent.createChooser(intent, "Share group"))
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
            // Search box
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Search groups") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                singleLine = true
            )

            val filteredGroups = if (searchQuery.isBlank()) groups else {
                val q = searchQuery.trim()
                groups.filter { it.name.contains(q, true) || it.description.contains(q, true) }
            }

            // Group List
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(filteredGroups) { group ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                            .clickable { onOpenGroup(group.id, group.name) },
                        colors = CardDefaults.cardColors(containerColor = dotWhite),
                        elevation = CardDefaults.cardElevation(6.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(group.name, style = MaterialTheme.typography.titleMedium, color = blueEnd)
                                Spacer(Modifier.height(4.dp))
                                Text(group.description, style = MaterialTheme.typography.bodyMedium, color = Color.Black)

                                // Actions below title/description
                                Spacer(Modifier.height(12.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    val isJoined = validJoins.contains(group.name)
                                    Button(
                                        onClick = { viewModel.toggleJoinGroup(group.name) },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isJoined) accentRed else accentGreen,
                                            contentColor = Color.White
                                        )
                                    ) { Text(if (isJoined) "Leave" else "Join") }

                                    Spacer(Modifier.width(8.dp))

                                    IconButton(onClick = { shareGroup(group.name, group.id) }) {
                                        Icon(Icons.Default.Share, contentDescription = "Share Group")
                                    }

                                    TextButton(onClick = {
                                        val link = "https://campusly.app/group/${group.id}?name=" + Uri.encode(group.name)
                                        val url = "https://www.facebook.com/sharer/sharer.php?u=" + Uri.encode(link)
                                        ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                    }) { Text("Facebook") }

                                    TextButton(onClick = {
                                        val link = "https://campusly.app/group/${group.id}?name=" + Uri.encode(group.name)
                                        val text = "Join the \"${group.name}\" study group on Campusly\n$link"
                                        val url = "https://twitter.com/intent/tweet?text=" + Uri.encode(text)
                                        ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                    }) { Text("Twitter") }
                                }
                            }

                            // Keep delete aligned to the right edge
                            IconButton(onClick = { viewModel.deleteStudyGroup(group.id, group.name) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete Group", tint = accentRed)
                            }
                        }
                    }
                }
            }

            // Section Divider for visual separation
            Divider(
                color = dotGrey,
                thickness = 2.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp)
            )

            // Joined Groups List (uses validJoinedGroups)
            if (validJoins.isNotEmpty()) {
                Text("Joined Groups:", style = MaterialTheme.typography.titleMedium, color = blueEnd)
                Spacer(modifier = Modifier.height(8.dp))
                validJoins.forEach { groupName ->
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
