#include "crow_all.h"
#include <sqlite3.h>
#include <iostream>

// ฟังก์ชันบันทึกออเดอร์ลง Database
void saveOrder(const std::string& customerName,
               const std::string& menu,
               int quantity,
               const std::string& address)
{
    sqlite3* db;
    sqlite3_open("orders.db", &db);

    const char* sql = "CREATE TABLE IF NOT EXISTS orders ("
                      "id INTEGER PRIMARY KEY AUTOINCREMENT,"
                      "customerName TEXT,"
                      "menu TEXT,"
                      "quantity INTEGER,"
                      "address TEXT,"
                      "status TEXT DEFAULT 'รอทำ');";
    sqlite3_exec(db, sql, 0, 0, 0);

    sqlite3_stmt* stmt;
    sql = "INSERT INTO orders (customerName, menu, quantity, address) VALUES (?, ?, ?, ?);";
    sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

    sqlite3_bind_text(stmt, 1, customerName.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, menu.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 3, quantity);
    sqlite3_bind_text(stmt, 4, address.c_str(), -1, SQLITE_STATIC);

    sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    sqlite3_close(db);
}

int main()
{
    crow::SimpleApp app;

    // เส้นทางรับออเดอร์
    CROW_ROUTE(app, "/order").methods("POST"_method)([](const crow::request& req){
        auto body = crow::query_string(req.body);

        std::string name = body.get("customerName") ? body.get("customerName") : "";
        std::string menu = body.get("menu") ? body.get("menu") : "";
        int quantity = body.get("quantity") ? std::stoi(body.get("quantity")) : 1;
        std::string address = body.get("address") ? body.get("address") : "";

        saveOrder(name, menu, quantity, address);

        return crow::response(200, "สั่งซื้อเรียบร้อยแล้ว!");
    });

    // เส้นทางดูออเดอร์ทั้งหมด
    CROW_ROUTE(app, "/orders")
    ([](){
        sqlite3* db;
        sqlite3_open("orders.db", &db);

        std::string result = "รายการออเดอร์:\n";
        sqlite3_stmt* stmt;
        const char* sql = "SELECT id, customerName, menu, quantity, address, status FROM orders;";
        sqlite3_prepare_v2(db, sql, -1, &stmt, 0);

        while (sqlite3_step(stmt) == SQLITE_ROW) {
            result += "OrderID: " + std::to_string(sqlite3_column_int(stmt, 0)) +
                      " | ชื่อ: " + (const char*)sqlite3_column_text(stmt, 1) +
                      " | เมนู: " + (const char*)sqlite3_column_text(stmt, 2) +
                      " | จำนวน: " + std::to_string(sqlite3_column_int(stmt, 3)) +
                      " | ที่อยู่: " + (const char*)sqlite3_column_text(stmt, 4) +
                      " | สถานะ: " + (const char*)sqlite3_column_text(stmt, 5) + "\n";
        }

        sqlite3_finalize(stmt);
        sqlite3_close(db);

        return crow::response(200, result);
    });

    app.port(18080).multithreaded().run();
}
