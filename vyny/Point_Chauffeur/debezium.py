from kafka import KafkaConsumer
import json
consumer = KafkaConsumer(
    'essaie.users', 
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='earliest',  
    enable_auto_commit=True,
    group_id='order-consumer-group',  
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)
print("En attente de nouveaux messages...")
for message in consumer:
    order_data = message.value
    # print(f"Message reçu : {order_data}")
    print(order_data)
print(consumer)