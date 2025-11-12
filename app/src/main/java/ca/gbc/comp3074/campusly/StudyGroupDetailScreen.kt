package ca.gbc.comp3074.campusly
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyGroupDetailScreen(
    groupId: Int,
    groupName: String,
    vm: GroupViewModel,
    onBack: () -> Unit
) {
    var tab by remember { mutableStateOf(0) }
    var showAddDialog by remember { mutableStateOf(false) }
    var newTitle by remember { mutableStateOf("") }
    var newBody by remember { mutableStateOf("") }

    LaunchedEffect(groupId) { vm.load(groupId) }

    val announcements by vm.announcements.collectAsState()
    val tasks by vm.tasks.collectAsState()
    val progress by vm.progress.collectAsState(ProgressRow(0,0))
    val statusFilter by vm.statusFilter.collectAsState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(groupName) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, null) }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                showAddDialog = true
                newTitle = ""
                newBody = ""
            }) { Icon(Icons.Filled.Add, null) }
        }
    ) { inner ->
        Column(Modifier.padding(inner)) {
            TabRow(selectedTabIndex = tab) {
                Tab(selected = tab == 0, onClick = { tab = 0 }, text = { Text("Announcements") })
                Tab(selected = tab == 1, onClick = { tab = 1 }, text = { Text("Tasks") })
            }
            if (tab == 0) {
                LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                    items(announcements) { a ->
                        ElevatedCard(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                            Column(Modifier.padding(12.dp)) {
                                Text(a.title, style = MaterialTheme.typography.titleMedium)
                                Spacer(Modifier.height(4.dp))
                                Text(a.body)
                                Spacer(Modifier.height(8.dp))
                                TextButton(onClick = { vm.togglePin(a.id, !a.pinned) }) {
                                    Text(if (a.pinned) "Unpin" else "Pin")
                                }
                            }
                        }
                    }
                }
            } else {
                Column {
                    Text(
                        "Progress: ${progress.done}/${progress.total}",
                        modifier = Modifier.padding(16.dp)
                    )
                    Row(Modifier.padding(horizontal = 16.dp)) {
                        StatusChip("All", statusFilter == null) { vm.setFilter(null) }
                        Spacer(Modifier.width(8.dp))
                        StatusChip("Incomplete", statusFilter == TaskStatus.INCOMPLETE) { vm.setFilter(TaskStatus.INCOMPLETE) }
                        Spacer(Modifier.width(8.dp))
                        StatusChip("Started", statusFilter == TaskStatus.STARTED) { vm.setFilter(TaskStatus.STARTED) }
                        Spacer(Modifier.width(8.dp))
                        StatusChip("Complete", statusFilter == TaskStatus.COMPLETE) { vm.setFilter(TaskStatus.COMPLETE) }
                    }
                    LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                        items(tasks) { t ->
                            ElevatedCard(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                                Column(Modifier.padding(12.dp)) {
                                    Text(t.title, style = MaterialTheme.typography.titleMedium)
                                    if (t.description.isNotBlank()) {
                                        Spacer(Modifier.height(4.dp)); Text(t.description)
                                    }
                                    Spacer(Modifier.height(8.dp))
                                    val next = when (t.status) {
                                        TaskStatus.INCOMPLETE -> TaskStatus.STARTED
                                        TaskStatus.STARTED -> TaskStatus.COMPLETE
                                        TaskStatus.COMPLETE -> TaskStatus.INCOMPLETE
                                    }
                                    AssistChip(
                                        onClick = { vm.setTaskStatus(t.id, next) },
                                        label = { Text(t.status.name.lowercase().replaceFirstChar { it.uppercase() }) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            confirmButton = {
                TextButton(onClick = {
                    if (tab == 0) vm.addAnnouncement(newTitle.ifBlank { "Announcement" }, newBody)
                    else vm.addTask(newTitle.ifBlank { "Task" }, newBody)
                    showAddDialog = false
                }) { Text("Save") }
            },
            dismissButton = { TextButton(onClick = { showAddDialog = false }) { Text("Cancel") } },
            title = { Text(if (tab == 0) "New Announcement" else "New Task") },
            text = {
                Column {
                    OutlinedTextField(newTitle, { newTitle = it }, label = { Text("Title") })
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(newBody, { newBody = it }, label = { Text(if (tab == 0) "Body" else "Description") })
                }
            }
        )
    }
}

@Composable
private fun StatusChip(text: String, selected: Boolean, onClick: () -> Unit) {
    AssistChip(
        onClick = onClick,
        label = { Text(text) },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = if (selected) MaterialTheme.colorScheme.primaryContainer
            else MaterialTheme.colorScheme.surface
        )
    )
}
