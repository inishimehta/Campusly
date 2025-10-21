package ca.gbc.comp3074.campusly

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import ca.gbc.comp3074.campusly.ui.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CampuslyApp()
        }
    }
}

@Composable
fun CampuslyApp() {
    val nav = rememberNavController()
    MaterialTheme {
        NavHost(navController = nav, startDestination = "splash") {
            composable("splash") {
                SplashScreen(
                    onDone = {
                        nav.navigate("home") {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                )
            }
            composable("home") {
                HomeScreen(
                    onPlaces = { nav.navigate("places") },
                    onEvents = { nav.navigate("eventList") },
                    onStudyGroups = { nav.navigate("studyGroups") },
                    onAnnouncements = { /* TODO: Navigate to Announcements */ },
                    onAbout = { nav.navigate("about") },
                    onNavigateHome = {
                        nav.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    }
                )
            }
            composable("places") {
                PlacesListScreen(
                    onOpenDetails = { id -> nav.navigate("placeDetails/$id") },
                    onAdd = { nav.navigate("placeEdit") }
                )
            }
            composable("studyGroups") {
                // Get the ViewModel scoped to the activity
                val vm: StudyGroupViewModel = viewModel(
                    factory = ViewModelProvider.AndroidViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )
                StudyGroupsScreen(
                    viewModel = vm,
                    onBack = { nav.popBackStack() }
                )
            }
            composable(
                route = "placeDetails/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType })
            ) { backStack ->
                val id = backStack.arguments?.getLong("id") ?: -1L
                PlaceDetailsScreen(
                    id = id,
                    onEdit = { nav.navigate("placeEdit?id=$id") },
                    onBack = { nav.popBackStack() }
                )
            }
            composable(
                route = "placeEdit?id={id}",
                arguments = listOf(navArgument("id") {
                    type = NavType.LongType
                    defaultValue = -1L
                })
            ) { backStack ->
                val id = backStack.arguments?.getLong("id") ?: -1L
                PlaceEditScreen(
                    id = id,
                    onDone = { nav.popBackStack() },
                    onCancel = { nav.popBackStack() }
                )
            }
            composable("eventList") {
                EventListScreen(
                    onOpenDetails = { id -> nav.navigate("eventDetails/$id") }
                )
            }

            composable(
                route = "eventDetails/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType })
            ) { backStack ->
                val id = backStack.arguments?.getLong("id") ?: -1L
                EventDetailsScreen(
                    eventId = id,
                    onRSVP = { nav.popBackStack() },
                    onBack = { nav.popBackStack() }
                )
            }
            composable("about") {
                AboutScreen(
                    onBack = { nav.popBackStack() },
                    onNavigateHome = { nav.navigate("home") {
                        popUpTo("home") { inclusive = true }
                    } }
                )
            }
        }
    }
}


