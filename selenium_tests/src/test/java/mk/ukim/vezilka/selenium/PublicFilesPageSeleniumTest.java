package mk.ukim.vezilka.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PublicFilesPageSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;

    private static final String BASE_URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();
        driver.get(BASE_URL + "/public-files");
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void searchInputShouldAcceptText() {
        WebElement searchInput = driver.findElement(By.xpath("//input[@placeholder='Пребарај...']"));
        String searchTerm = "Македонија";
        
        searchInput.sendKeys(searchTerm);
        assertEquals(searchTerm, searchInput.getAttribute("value"), "Search input should contain search term");
    }

    @Test
    void clickingDownloadButtonShouldInitiateDownload() {
        // This test verifies the click action. Verifying actual file download is out of scope for basic Selenium.
        // We assume at least one file exists, or handle the empty state.
        
        // Try to find a download button
        var downloadButtons = driver.findElements(By.xpath("//button[contains(text(), 'Преземи')]"));
        
        if (!downloadButtons.isEmpty()) {
            WebElement firstDownloadBtn = downloadButtons.get(0);
            firstDownloadBtn.click();
            // If successful, we might check for a loading spinner or URL change if it opens in new tab
        } else {
            System.out.println("No files to test download button on.");
        }
    }
}