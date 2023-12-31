# Generated by Django 4.0 on 2023-07-22 10:01

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('vote', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='name',
            field=models.CharField(default='', max_length=256),
        ),
        migrations.AlterField(
            model_name='vote',
            name='vote_context',
            field=models.ForeignKey(default=999999, on_delete=django.db.models.deletion.CASCADE, to='vote.votecontext'),
        ),
        migrations.AlterField(
            model_name='votecontext',
            name='allow_create_extra_ops',
            field=models.BooleanField(default=False),
        ),
    ]
