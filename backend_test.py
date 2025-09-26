import requests
import sys
import json
from datetime import datetime

class ProFireManagerAPITester:
    def __init__(self, base_url="https://emergency-shifts-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, description=""):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "name": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "",
            200,
            description="Check if API is running"
        )

    def test_init_demo_data(self):
        """Initialize demo data"""
        return self.run_test(
            "Initialize Demo Data",
            "POST",
            "init-demo-data",
            200,
            description="Initialize demo users and data"
        )

    def test_login(self, email, password, role):
        """Test login and store token"""
        success, response = self.run_test(
            f"Login {role}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "mot_de_passe": password},
            description=f"Login as {role} user"
        )
        
        if success and 'access_token' in response:
            self.tokens[role] = response['access_token']
            self.users[role] = response['user']
            print(f"   Token stored for {role}: {response['user']['nom']} {response['user']['prenom']}")
            return True
        return False

    def test_auth_me(self, role):
        """Test getting current user info"""
        if role not in self.tokens:
            print(f"❌ No token available for {role}")
            return False
            
        return self.run_test(
            f"Get Current User ({role})",
            "GET",
            "auth/me",
            200,
            token=self.tokens[role],
            description=f"Get current user info for {role}"
        )

    def test_get_users(self, role):
        """Test getting users list"""
        if role not in self.tokens:
            print(f"❌ No token available for {role}")
            return False
            
        expected_status = 200 if role in ['admin', 'superviseur'] else 403
        return self.run_test(
            f"Get Users ({role})",
            "GET",
            "users",
            expected_status,
            token=self.tokens[role],
            description=f"Get users list as {role} - should {'succeed' if expected_status == 200 else 'fail with 403'}"
        )

    def test_get_statistics(self, role):
        """Test getting statistics"""
        if role not in self.tokens:
            print(f"❌ No token available for {role}")
            return False
            
        return self.run_test(
            f"Get Statistics ({role})",
            "GET",
            "statistiques",
            200,
            token=self.tokens[role],
            description=f"Get dashboard statistics as {role}"
        )

    def test_get_types_garde(self, role):
        """Test getting guard types"""
        if role not in self.tokens:
            print(f"❌ No token available for {role}")
            return False
            
        return self.run_test(
            f"Get Types Garde ({role})",
            "GET",
            "types-garde",
            200,
            token=self.tokens[role],
            description=f"Get guard types as {role}"
        )

    def test_get_planning(self, role):
        """Test getting planning for current week"""
        if role not in self.tokens:
            print(f"❌ No token available for {role}")
            return False
            
        # Get current week start (Monday)
        today = datetime.now()
        days_since_monday = today.weekday()
        monday = today.replace(hour=0, minute=0, second=0, microsecond=0)
        monday = monday.replace(day=today.day - days_since_monday)
        week_start = monday.strftime("%Y-%m-%d")
        
        return self.run_test(
            f"Get Planning ({role})",
            "GET",
            f"planning/{week_start}",
            200,
            token=self.tokens[role],
            description=f"Get planning for week {week_start} as {role}"
        )

    def test_get_remplacements(self, role):
        """Test getting replacement requests"""
        if role not in self.tokens:
            print(f"❌ No token available for {role}")
            return False
            
        return self.run_test(
            f"Get Remplacements ({role})",
            "GET",
            "remplacements",
            200,
            token=self.tokens[role],
            description=f"Get replacement requests as {role}"
        )

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        endpoints = ["auth/me", "users", "statistiques", "types-garde"]
        
        for endpoint in endpoints:
            success, _ = self.run_test(
                f"Unauthorized {endpoint}",
                "GET",
                endpoint,
                401,
                description=f"Should fail without authentication token"
            )

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "mot_de_passe": "wrongpassword"},
            description="Should fail with invalid credentials"
        )

def main():
    print("🚒 ProFireManager API Testing Suite")
    print("=" * 50)
    
    tester = ProFireManagerAPITester()
    
    # Test demo accounts
    demo_accounts = [
        ("admin@firemanager.ca", "admin123", "admin"),
        ("superviseur@firemanager.ca", "superviseur123", "superviseur"),
        ("employe@firemanager.ca", "employe123", "employe"),
        ("partiel@firemanager.ca", "partiel123", "partiel")
    ]

    print("\n📋 Phase 1: Basic API Tests")
    print("-" * 30)
    
    # Test API root
    tester.test_root_endpoint()
    
    # Initialize demo data
    tester.test_init_demo_data()
    
    # Test invalid login
    tester.test_invalid_login()
    
    # Test unauthorized access
    tester.test_unauthorized_access()

    print("\n🔐 Phase 2: Authentication Tests")
    print("-" * 30)
    
    # Test login for all demo accounts
    for email, password, role in demo_accounts:
        tester.test_login(email, password, role)

    print("\n👤 Phase 3: User Management Tests")
    print("-" * 30)
    
    # Test auth/me for all roles
    for _, _, role in demo_accounts:
        tester.test_auth_me(role)
    
    # Test get users with different roles (should work for admin/superviseur, fail for others)
    for _, _, role in demo_accounts:
        tester.test_get_users(role)

    print("\n📊 Phase 4: Data Access Tests")
    print("-" * 30)
    
    # Test statistics access for all roles
    for _, _, role in demo_accounts:
        tester.test_get_statistics(role)
    
    # Test types garde access for all roles
    for _, _, role in demo_accounts:
        tester.test_get_types_garde(role)
    
    # Test planning access for all roles
    for _, _, role in demo_accounts:
        tester.test_get_planning(role)
    
    # Test remplacements access for all roles
    for _, _, role in demo_accounts:
        tester.test_get_remplacements(role)

    # Print final results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Total tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(tester.failed_tests)}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['name']}")
            if 'expected' in test:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                print(f"   Response: {test['response']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
    
    print(f"\n🔑 Stored tokens for roles: {list(tester.tokens.keys())}")
    print(f"👥 User info retrieved for: {list(tester.users.keys())}")
    
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())