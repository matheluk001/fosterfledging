import unittest, time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException


class AcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1280,900")

        cls.driver = webdriver.Remote(
            command_executor="http://chrome:4444/wd/hub", options=chrome_options
        )

        cls.driver.set_window_size(1280, 900)
        cls.base_url = "https://fosterfledging.me/"
        cls.wait = WebDriverWait(cls.driver, 12)

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, "driver"):
            cls.driver.quit()

    def wait_for_page_ready(self):
        self.wait.until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

    def open_and_click_link(self, link_text, expected_url_part):
        try:
            self.driver.get(self.base_url)
            # Wait until the page is fully loaded
            self.wait.until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            # Wait for the navbar to exist (using a class that actually exists)
            navbar = self.wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, ".navbar"))
            )

            try:
                toggler = self.driver.find_element(By.CLASS_NAME, "navbar-toggler")
                if toggler.is_displayed():
                    self.driver.execute_script("arguments[0].click();", toggler)
                    self.wait.until(lambda d: "show" in navbar.get_attribute("class"))
            except Exception:
                pass

            link = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, f"//a[contains(@href, '{expected_url_part}')]")
                )
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", link)
            self.driver.execute_script("arguments[0].click();", link)

            self.wait.until(lambda d: expected_url_part in d.current_url)
            self.assertIn(expected_url_part, self.driver.current_url)

        except TimeoutException:
            self.save_debug_screenshot(self._testMethodName)
            raise

    def save_debug_screenshot(self, name):
        import os

        os.makedirs("screenshots", exist_ok=True)
        path = f"screenshots/{name}.png"
        self.driver.save_screenshot(path)
        print(f"[DEBUG] Saved screenshot: {path}")

    def test_1_home_link_check(self):
        self.driver.get(self.base_url)
        home_link = self.driver.find_element(By.LINK_TEXT, "Home")
        self.driver.execute_script("arguments[0].click();", home_link)
        self.assertIn("/", self.driver.current_url)

    def test_2_main_check(self):
        self.driver.get(self.base_url)
        header = self.driver.find_element(By.LINK_TEXT, "FosterFledging")
        self.assertTrue(header.is_displayed())

    def test_3_title_check(self):
        self.driver.get(self.base_url)
        self.assertIn("FosterFledging", self.driver.title)

    def test_4_footer_check(self):
        self.driver.get(self.base_url)
        footer = self.driver.find_element(By.TAG_NAME, "footer")
        self.assertTrue(footer.is_displayed())
        # Reset viewport
        self.driver.set_window_size(1280, 900)

    def test_5_nav_links_visible(self):
        """Ensure all expected navbar links are present and visible."""
        self.driver.get(self.base_url)
        expected_links = ["Home", "Housing", "Counseling", "Organizations", "About"]

        for text in expected_links:
            link = self.wait.until(
                EC.visibility_of_element_located((By.LINK_TEXT, text))
            )
            self.assertTrue(link.is_displayed(), f"{text} link should be visible")

    def test_6_navigation_housing(self):
        """Click Housing and confirm routing works."""
        self.open_and_click_link("Housing", "/housing")

    def test_7_navigation_counseling(self):
        """Click Counseling and confirm routing works."""
        self.open_and_click_link("Counseling", "/counseling")

    def test_8_navigation_organizations(self):
        """Click Organizations and confirm routing works."""
        self.open_and_click_link("Organizations", "/organizations")

    def test_9_navigation_about(self):
        """Click About and confirm routing works."""
        self.open_and_click_link("About", "/about")

    def test_10_landing_page_content(self):
        """Ensure hero/landing elements render correctly."""
        self.driver.get(self.base_url)
        # Check for a key landing page element (hero header text)
        hero = self.wait.until(EC.visibility_of_element_located((By.XPATH, "//h1")))
        self.assertTrue(hero.is_displayed(), "Landing page hero text should be visible")


if __name__ == "__main__":
    unittest.main()
