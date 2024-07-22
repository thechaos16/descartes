
import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';

import "db.dart";
import 'constants.dart';


class DBViewPage extends StatelessWidget {
  const DBViewPage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(246, 179, 241, 192),
        title: Text(title),
      ),
      body: Container(
        alignment: FractionalOffset.center,
        child: Column(
          children: <Widget>[
            TextButton(
              onPressed: () {
                deleteDatabase(dbName);
              },
              child: const Text(
                'Delete database',
                style: TextStyle(
                  fontSize: 20,
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                final result = countRecord(dbName);
                print(result);
              },
              child: const Text(
                'Count',
                style: TextStyle(
                  fontSize: 20,
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                final result = selectAll(dbName);
                print(result);
              },
              child: const Text(
                'Show all',
                style: TextStyle(
                  fontSize: 20,
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                final result = selectRandomUri(dbName);
                result.then((data){
                    print(data);
                  },
                );
              },
              child: const Text(
                'Random select',
                style: TextStyle(
                  fontSize: 20,
                ),
              ),
            ),
          ],
        )
      ),
    );
  }
}