from pyathenajdbc import connect
from flask import render_template, request, g
from flask_appbuilder import BaseView
from flask_appbuilder.views import expose

from superset import appbuilder, db
from superset.connectors.sqla.models import SqlaTable, TableColumn
from superset.models.core import Database
from superset.views.utils import parse_sqalchemy_uri
from superset.savvy.models import Group, Site, SavvyUser


class MeterDataView(BaseView):
    route_base = "/superset"

    @expose('/meterdata/<string:table_id>', methods=['GET', 'POST'])
    def method1(self, table_id):
        page = int(request.args.get('page_meter', 0))
        page_size = int(request.args.get('page_size', 50))

        tb_obj = db.session.query(SqlaTable).get(int(table_id))
        db_obj = db.session.query(Database).get(tb_obj.database_id)
        tb_columns = db.session.query(TableColumn).filter_by(table_id=tb_obj.id).all()

        url_parsed = parse_sqalchemy_uri(db_obj.sqlalchemy_uri)
        conn = connect(access_key=url_parsed['access_key'],
                       secret_key=db_obj.password,
                       s3_staging_dir=url_parsed['s3_staging_dir'],
                       schema_name=tb_obj.schema,
                       region_name=url_parsed['region_name'])
        try:
            select_fields = ""
            for column in tb_columns:
                select_fields = select_fields+column.column_name+","
            select_fields = select_fields[:-1]

            roles = [role.name for role in g.user.roles]

            with conn.cursor() as cursor:

                if 'Admin' in roles:
                    cursor.execute("""
                            SELECT count(*)
                            FROM {table_name}
                        """.format(table_name=tb_obj.table_name)
                    )
                    row_count = cursor.fetchone()[0]
                    sites_filter_clause = ""
                else:
                    sites = db.session.query(Site).filter(
                        Site.groups.any(Group.user.any(SavvyUser.id == g.user.id))).all()
                    SITE_IDS = [str(row.SiteID) for row in sites]

                    if len(SITE_IDS) > 0:
                        sites_filter_clause = "WHERE site_id IN ( "
                        for index, site_id in enumerate(SITE_IDS):
                            if index != len(SITE_IDS)-1:
                                sites_filter_clause = sites_filter_clause+site_id + ','
                            else:
                                sites_filter_clause = sites_filter_clause + site_id + ')'
                    else:
                        sites_filter_clause = "WHERE site_id IN ( -1 )"

                    cursor.execute("""
                            SELECT count(*)
                            FROM {table_name}
                            {where_clause}
                        """.format(table_name=tb_obj.table_name, where_clause=sites_filter_clause)
                    )
                    row_count = cursor.fetchone()[0]

                cursor.execute("""
                        SELECT {fields} 
                        FROM (SELECT row_number() over() AS rn, * FROM {table_name} {where_clause})
                        WHERE rn BETWEEN {offset} AND {position}
                    """.format(fields=select_fields,
                               table_name=tb_obj.table_name,
                               where_clause=sites_filter_clause,
                               offset=page*page_size,
                               position=(page+1)*page_size)
                )
                meter_data = cursor.fetchall()
        finally:
            conn.close()

        label_colums = [row.column_name for row in tb_columns]

        return render_template('superset/meterdata_list.html',
                               label_columns=label_colums,
                               count=row_count,
                               appbuilder=appbuilder,
                               meter_data=meter_data,
                               page_size=page_size,
                               page=page,
                               modelview_name="meter"
                               )

appbuilder.add_view_no_menu(MeterDataView)