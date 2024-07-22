
import 'package:sqflite/sqflite.dart';
import 'package:sqflite/utils/utils.dart';

String tableName = 'uri_table';


Future<Database> openDatabase(String dbName) async {
  // await Sqflite.devSetOptions(SqfliteOptions(logLevel: sqfliteLogLevelVerbose));
  return await databaseFactory.openDatabase(
    dbName,
    options: OpenDatabaseOptions(
        version: 1,
        onCreate: (db, version) async {
          await db.execute('CREATE TABLE $tableName (uri TEXT, pushed BOOL, add_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, push_date TIMESTAMP, read bool)');
        }
    )
  );
}

Future closeDatabase(Database database) async {
  await database.close();
}

Future delteDatabase(String dbName) async {
  await databaseFactory.deleteDatabase(dbName);
}

Future<int?> countRecord(String dbName) async {
  final db = await openDatabase(dbName);
  final result = firstIntValue(await db.query(tableName, columns: ['COUNT(*)']));
  print(result);
  return result;
}

Future selectAll(String dbName) async {
  final db = await openDatabase(dbName);
  final result = await db.query(tableName, columns: ['*']);
  print(result.first);
  //return result;
}

Future<Object?> selectRandomUri(String dbName) async {
  final db = await openDatabase(dbName);
  final result = await db.rawQuery('SELECT uri FROM $tableName WHERE NOT pushed ORDER BY RANDOM() LIMIT 1;');
  return result.first['uri'];
}

Future insertRecord(String dbName, String uri) async {
  final db = await openDatabase(dbName);
  await db.insert(tableName, {'uri': uri, 'pushed': false});
}
