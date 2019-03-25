from pyathenajdbc import connect
from flask_appbuilder import BaseView
from flask_appbuilder.views import expose

from superset import appbuilder, db
from superset.connectors.sqla.models import SqlaTable
from superset.models.core import Database
from superset.views.utils import parse_sqalchemy_uri


class MeterDataView(BaseView):
    route_base = "/superset"

    @expose('/meterdata/<string:table_id>')
    def method1(self, table_id):
        tb_obj = db.session.query(SqlaTable).get(int(table_id))
        db_obj = db.session.query(Database).get(tb_obj.database_id)

        url_parsed = parse_sqalchemy_uri(db_obj.sqlalchemy_uri)
        conn = connect(access_key=url_parsed['access_key'],
                       secret_key=db_obj.password,
                       s3_staging_dir=url_parsed['s3_staging_dir'],
                       schema_name=url_parsed['schema_name'],
                       region_name=url_parsed['region_name'])

        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                SELECT * FROM imd_15min_test_db_meter_loader LIMIT 10
                """)
                for row in cursor:
                    print(row)
        finally:
            conn.close()

        return table_id

appbuilder.add_view_no_menu(MeterDataView)