package gps.pen.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Hide system bars initially
        // hideSystemBars();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Ensure system bars remain hidden when activity resumes
        // hideSystemBars();
    }

    // private void hideSystemBars() {
    //     WindowInsetsControllerCompat windowInsetsController = 
    //         WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            
    //     // Configure the behavior of the hidden system bars
    //     windowInsetsController.setSystemBarsBehavior(
    //         WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

    //     // Hide both the status bar and the navigation bar
    //     windowInsetsController.hide(WindowInsetsCompat.Type.systemBars());
    // }
}
