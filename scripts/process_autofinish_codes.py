#!/usr/bin/env python3
"""
AUTOFINISH Code Sequential Processor
Script for processing 550 AUTOFINISH codes one by one
"""

import requests
import time
import sys
from typing import Optional

# Configuration
API_BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = "your_admin_token_here"  # Replace with actual admin token


class CodeProcessor:
    """Sequential code processor for AUTOFINISH codes"""
    
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def generate_batch(self, count: int = 550, discount: float = 10.0) -> Optional[str]:
        """
        Generate a batch of AUTOFINISH codes
        
        Args:
            count: Number of codes to generate
            discount: Discount percentage
        
        Returns:
            batch_id if successful, None otherwise
        """
        url = f"{self.base_url}/api/codes/generate-batch"
        payload = {
            "count": count,
            "code_type": "autofinish",
            "discount_percentage": discount,
            "valid_days": 365
        }
        
        print(f"📝 Generating {count} AUTOFINISH codes...")
        
        try:
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            
            codes = response.json()
            if codes and len(codes) > 0:
                batch_id = codes[0].get("batch_id")
                print(f"✅ Generated {len(codes)} codes successfully!")
                print(f"📦 Batch ID: {batch_id}")
                return batch_id
            else:
                print("❌ No codes generated")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error generating codes: {e}")
            return None
    
    def get_pending_codes(self, batch_id: str) -> list:
        """
        Get all pending codes in a batch
        
        Args:
            batch_id: Batch identifier
        
        Returns:
            List of pending codes
        """
        url = f"{self.base_url}/api/codes/"
        params = {
            "batch_id": batch_id,
            "status": "pending",
            "limit": 1000
        }
        
        try:
            response = requests.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching codes: {e}")
            return []
    
    def process_code(self, code_id: int) -> bool:
        """
        Process (activate) a single code
        
        Args:
            code_id: Code ID to process
        
        Returns:
            True if successful, False otherwise
        """
        url = f"{self.base_url}/api/codes/process/{code_id}"
        
        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Error processing code {code_id}: {e}")
            return False
    
    def process_sequential(self, batch_id: str, delay: float = 0.5):
        """
        Process all codes in a batch sequentially
        
        Args:
            batch_id: Batch identifier
            delay: Delay between processing each code (seconds)
        """
        print(f"\n🔄 Starting sequential processing for batch: {batch_id}")
        print("=" * 60)
        
        # Get all pending codes
        pending_codes = self.get_pending_codes(batch_id)
        total = len(pending_codes)
        
        if total == 0:
            print("ℹ️  No pending codes to process")
            return
        
        print(f"📋 Found {total} codes to process")
        print("=" * 60)
        
        # Sort by sequence number
        pending_codes.sort(key=lambda x: x.get("sequence_number", 0))
        
        # Process each code
        processed = 0
        failed = 0
        
        for i, code in enumerate(pending_codes, 1):
            code_id = code.get("id")
            code_str = code.get("code")
            seq_num = code.get("sequence_number")
            
            print(f"\n[{i}/{total}] Processing: {code_str} (Sequence #{seq_num})...")
            
            if self.process_code(code_id):
                processed += 1
                print(f"  ✅ Successfully activated!")
                print(f"  📊 Progress: {processed}/{total} ({processed*100//total}%)")
            else:
                failed += 1
                print(f"  ❌ Failed to activate")
            
            # Delay before next processing
            if i < total:
                time.sleep(delay)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 PROCESSING SUMMARY")
        print("=" * 60)
        print(f"✅ Successfully processed: {processed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success rate: {processed*100//total}%")
        print("=" * 60)
    
    def process_batch_all(self, batch_id: str):
        """
        Process entire batch at once
        
        Args:
            batch_id: Batch identifier
        """
        url = f"{self.base_url}/api/codes/process-batch/{batch_id}"
        
        print(f"\n⚡ Processing entire batch at once: {batch_id}")
        print("=" * 60)
        
        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
            
            codes = response.json()
            print(f"✅ Successfully processed {len(codes)} codes!")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error processing batch: {e}")
    
    def get_stats(self, batch_id: str):
        """
        Get batch statistics
        
        Args:
            batch_id: Batch identifier
        """
        url = f"{self.base_url}/api/codes/batch/{batch_id}/stats"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            stats = response.json()
            
            print("\n" + "=" * 60)
            print("📊 BATCH STATISTICS")
            print("=" * 60)
            print(f"Batch ID: {stats['batch_id']}")
            print(f"Total Codes: {stats['total_codes']}")
            print("-" * 60)
            print(f"⏳ Pending:  {stats['pending']}")
            print(f"✅ Active:   {stats['active']}")
            print(f"🔵 Used:     {stats['used']}")
            print(f"🔴 Expired:  {stats['expired']}")
            print(f"⚫ Disabled: {stats['disabled']}")
            print("-" * 60)
            print(f"Total Usage: {stats['total_usage']}")
            print("=" * 60)
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching stats: {e}")


def main():
    """Main function"""
    print("=" * 60)
    print("AUTOFINISH CODE SEQUENTIAL PROCESSOR")
    print("=" * 60)
    
    # Initialize processor
    processor = CodeProcessor(API_BASE_URL, ADMIN_TOKEN)
    
    # Menu
    print("\nOptions:")
    print("1. Generate 550 codes")
    print("2. Process codes sequentially (one by one)")
    print("3. Process entire batch (all at once)")
    print("4. View batch statistics")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == "1":
        count = input("Number of codes to generate [550]: ").strip()
        count = int(count) if count else 550
        
        discount = input("Discount percentage [10.0]: ").strip()
        discount = float(discount) if discount else 10.0
        
        batch_id = processor.generate_batch(count, discount)
        
        if batch_id:
            print(f"\n💾 Save this Batch ID: {batch_id}")
            print("You'll need it for processing!")
    
    elif choice == "2":
        batch_id = input("Enter Batch ID: ").strip()
        if batch_id:
            delay = input("Delay between codes in seconds [0.5]: ").strip()
            delay = float(delay) if delay else 0.5
            
            processor.process_sequential(batch_id, delay)
    
    elif choice == "3":
        batch_id = input("Enter Batch ID: ").strip()
        if batch_id:
            confirm = input(f"Process entire batch {batch_id}? (yes/no): ").strip().lower()
            if confirm == "yes":
                processor.process_batch_all(batch_id)
    
    elif choice == "4":
        batch_id = input("Enter Batch ID: ").strip()
        if batch_id:
            processor.get_stats(batch_id)
    
    elif choice == "5":
        print("👋 Goodbye!")
        sys.exit(0)
    
    else:
        print("❌ Invalid choice")


if __name__ == "__main__":
    main()
