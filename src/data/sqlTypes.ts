type SQLiteType = 'INTEGER' | 'TEXT' | 'REAL' | 'INTEGER PRIMARY KEY AUTOINCREMENT';
type ForeignKeyType = [string, string, string]; // [localColumn, referencedTable, referencedColumn]

type MapSQLiteTypeToTS<T extends SQLiteType | ForeignKeyType> =
  T extends 'INTEGER' | 'INTEGER PRIMARY KEY AUTOINCREMENT' ? number :
  T extends 'TEXT' ? string :
  T extends 'REAL' ? number :
  T extends ForeignKeyType ? ForeignKeyType :
  never;

type TableSchemaSql = Record<string, SQLiteType | ForeignKeyType>;


// Helper types to exclude foreign key from the schema
type ExcludeForeignKey<K extends keyof any, T> =
  T extends ForeignKeyType ? never :
  K;

type FilteredKeys<T extends TableSchemaSql> = {
  [K in keyof T as ExcludeForeignKey<K, T[K]>]: MapSQLiteTypeToTS<T[K]>
};

type SchemaTs<T extends TableSchemaSql> = { [K in keyof FilteredKeys<T>]: FilteredKeys<T>[K] };
// Wrapper type that omits the id field
type InsertableRecord<T extends SchemaTs<TableSchemaSql>> = Omit<T, 'id'>;


// Type guard to check if a value is a ForeignKeyType
function isForeignKeyType(value: any): value is ForeignKeyType {
  return Array.isArray(value) && value.length === 3 && typeof value[1] === 'string';
}

export { SchemaTs, TableSchemaSql, InsertableRecord, ForeignKeyType, isForeignKeyType };
