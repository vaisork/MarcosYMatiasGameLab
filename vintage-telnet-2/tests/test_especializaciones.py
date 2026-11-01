"""E1+E2: especializaciones, combate y rangos basados en hechos."""
import unittest
import random
from pathlib import Path

from server import mechanics as m
from server.content import Content
from server.engine import Engine, RuleError


ROOT = Path(__file__).resolve().parents[1]


class FixedRandom:
    def __init__(self, value=0): self.value = value
    def random(self): return self.value


class EspecializacionesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.content = Content(ROOT / 'content')

    def setUp(self): self.now = 1_800_000_000; self.engine = Engine(self.content, lambda: self.now, FixedRandom())

    def combatant(self, cls='arcano', cid=1, location='valdren_plaza', spec=None):
        state=m.new_state('humano',cls,'home:test',self.now);state.update(level=20,location=location)
        if spec:state['especializacion']={'id':spec,'desde':self.now,'reconsiderada':False}
        state['combat']={'creature':'mordelinde','profile':dict(m.PROFILES['mordelinde']),'hp':1000,'round':0,'next_round':self.now+4,'cooldown':0,'prepared':False}
        return {'id':cid,'name':f'Prueba {cid}','species':'humano','class_id':cls,'status':'approved','state':state}

    def test_echo_power_and_collection_order_exclusions(self):
        self.assertEqual([m.eco_power(cid) for cid in ('sierpe_veta_madre','tallagrietas','mordelinde')],[8,5,3])
        state={'flags':['victoria:a:mordelinde','victoria:b:tallagrietas','victoria:c:sierpe_veta_madre','victoria:d:forajido_camino']}
        found=m.ecos(state,{'forajido_camino'})
        self.assertEqual([e['power'] for e in found],[8,5,3])
        self.assertEqual({e['id'] for e in found},{'sierpe_veta_madre','tallagrietas','mordelinde'})

    def test_specialization_changes_only_arcane_maximum_health(self):
        arc=m.new_state('humano','arcano','home',self.now);arc['level']=20
        base=m.hp_max(arc);arc['especializacion']={'id':'arcano_ecos'}
        self.assertEqual(m.hp_max(arc),base*.9)
        for cls in ('juramentado','sombra','artifice'):
            state=m.new_state('humano',cls,'home',self.now);state['especializacion']={'id':'arcano_ecos'}
            self.assertEqual(m.hp_max(state),100)

    def test_velo_blocks_exactly_one_connected_response(self):
        state=self.combatant()['state'];state['especializacion']={'id':'arcano_ecos'}
        state['combat'].update(profile=dict(m.PROFILES['espinajo_rastrojo']),intervention={'id':'velo_espectral'})
        hp=state['hp'];m.resolve_round(state,{'name':'Espinajo'},FixedRandom(),respond=True)
        self.assertEqual(state['hp'],hp);self.assertTrue(state['combat']['_response']['phase'])
        self.assertNotIn('velo',state['combat'])
        state['combat']['intervention']={'id':'atacar'}
        m.resolve_round(state,{'name':'Espinajo'},FixedRandom(),respond=True)
        self.assertLess(state['hp'],hp)

    def test_echo_strikes_three_rounds_and_multiplies_fatigue(self):
        state=self.combatant()['state'];state['especializacion']={'id':'arcano_ecos'}
        state['combat']['intervention']={'id':'invocar_eco','eco':{'id':'tallagrietas','name':'Tallagrietas','power':5}}
        hit_events=0
        for n in range(3):
            lines,_=m.resolve_round(state,{'name':'Rival'},FixedRandom(),respond=False)
            hit_events+=sum('se lanza contra' in e['text'] for e in lines)
            if n<2:state['combat']['intervention']={'id':'atacar'}
        self.assertEqual(hit_events,3)
        self.assertNotIn('eco',state['combat'])
        state['fatigue']=0;state['combat']['eco']={'id':'tallagrietas','name':'Tallagrietas','power':5,'rounds':2};state['combat']['intervention']={'id':'atacar'}
        m.resolve_round(state,{'name':'Rival'},FixedRandom(),respond=False)
        self.assertAlmostEqual(state['fatigue'],m.fatigue_cost(state,4)*m.ECO_FATIGUE)

    def test_heroic_inspiration_has_rank_values_and_duration(self):
        state=self.combatant('juramentado',spec='juramentado_heroico')['state'];state['flags']=['rango:defensor:valdren']
        state['combat']['intervention']={'id':'inspirar_valentia'}
        lines,_=m.resolve_round(state,{'name':'Rival'},FixedRandom(),respond=False)
        effect=state['combat']['inspirado']
        self.assertEqual(effect,{'acc':6,'fat':.20,'red':0,'rounds':2})
        self.assertTrue(any('Usas Inspirar Valentía' in e['text'] for e in lines))

    def test_rank_requirements_cover_every_design_row(self):
        cases={
            'rango:escudero':{'encargo_pagado:uno'},
            'rango:defensor:valdren':{'victoria:edran_prado:cornalomo'},
            'rango:defensor:khariel':{'victoria:hoshai_campamento_lona:forajido_camino'},
            'rango:defensor:brumak':{'victoria:korven_grieta_nido:quebrarrocas_canoso'},
            'rango:defensor:narevia':{'victoria:lethra_orilla_silente:dorsalodo'},
            'rango:defensor:velmora':{'victoria:nhal_raiz_marcada:rasgacorteza'},
            'rango:defensor:vaisgard':{'victoria:veyra_mazmorra_cornisa:mordesombra'},
            'rango:campeon:veyra':{'participated:dragon_vencido'},
            'rango:campeon:korven':{'victoria:korven_grieta_nido:quebrarrocas_canoso','victoria:korven_grieta_telar:tejecristal'},
            'rango:heroe':{'victoria:korven_grieta_corazon:sierpe_veta_madre'},
        }
        for expected,flags in cases.items():self.assertIn(expected,m.ranks_from_flags(flags),expected)
        self.assertNotIn('rango:campeon:korven',m.ranks_from_flags({'victoria:korven_grieta_nido:quebrarrocas_canoso'}))
        self.assertIn('rango:heroe',m.ranks_from_flags({'rango:campeon:a','rango:campeon:b','rango:campeon:c'}))
        self.assertIn('rango:defensor',m.ranks_from_flags(cases['rango:defensor:narevia']))

    def test_specialization_validation_and_one_lifetime_reconsideration(self):
        arc=m.new_state('humano','arcano','home',self.now);arc.update(level=20,hp=100)
        with self.assertRaises(RuleError):self.engine.effects(arc,{'flags':[]},{'set_specialization':'juramentado_heroico'})
        arc['level']=19
        with self.assertRaises(RuleError):self.engine.effects(arc,{'flags':[]},{'set_specialization':'arcano_ecos'})
        arc['level']=20;world={'flags':[]};self.engine.effects(arc,world,{'set_specialization':'arcano_ecos'})
        self.assertEqual(m.specialization(arc),'arcano_ecos');self.assertIn('especializacion:arcano_ecos',arc['flags'])
        self.engine.effects(arc,world,{'set_specialization':None})
        self.assertIsNone(m.specialization(arc));self.assertIn('reconsideracion_usada',arc['flags'])
        self.engine.effects(arc,world,{'set_specialization':'arcano_ecos'})
        with self.assertRaises(RuleError):self.engine.effects(arc,world,{'set_specialization':None})

    def test_specialization_content_action_obeys_level_and_class_guards(self):
        room=self.content.rooms['valdren_plaza'];original=room.get('actions')
        room['actions']=list(original or [])+[{'id':'jurar_ecos','label':'Unir los cristales','requires_level':20,'requires_classes':['arcano'],'set_specialization':'arcano_ecos'}]
        try:
            state=m.new_state('humano','arcano','home:test',self.now);state['location']='valdren_plaza';state['level']=19
            char={'id':7,'name':'Arcano','species':'humano','class_id':'arcano','status':'approved','state':state};world={'flags':[],'deaths':{}}
            self.assertNotIn('jurar_ecos',[a['id'] for a in self.engine.actions(char,world)])
            state['level']=20
            self.assertIn('jurar_ecos',[a['id'] for a in self.engine.actions(char,world)])
            state['class_id']='juramentado';char['class_id']='juramentado'
            self.assertNotIn('jurar_ecos',[a['id'] for a in self.engine.actions(char,world)])
        finally:
            if original is None:room.pop('actions',None)
            else:room['actions']=original

    def test_victory_awards_new_heroic_rank_from_its_flag(self):
        char=self.combatant('juramentado',spec='juramentado_heroico');state=char['state']
        state['location']='edran_prado';creature=self.content.creatures['cornalomo']
        combat={'creature':'cornalomo','profile':dict(m.PROFILES['cornalomo']),'hp':0}
        state['combat']=combat;world={'flags':[],'deaths':{},'encounters':{}}
        self.engine.victory(char,world,combat,creature)
        self.assertIn('rango:defensor:valdren',state['flags'])
        self.assertTrue(any('Defensor de Valdren' in e['text'] for e in state['events']))

    def test_shared_inspiration_reaches_allies_and_veil_protects_primary(self):
        primary=self.combatant('arcano',1,'valdren_plaza','arcano_ecos')
        ally=self.combatant('juramentado',2,'valdren_plaza','juramentado_heroico')
        primary['state']['combat'].update(creature='tallagrietas',profile=dict(m.PROFILES['tallagrietas']),hp=500,intervention={'id':'velo_espectral'})
        ally['state']['combat'].update(creature='tallagrietas',profile=dict(m.PROFILES['tallagrietas']),hp=500,intervention={'id':'inspirar_valentia'})
        world={'flags':[],'deaths':{},'encounters':{'valdren_plaza:tallagrietas':1},'version':0}
        self.now+=4;before=primary['state']['hp']
        self.engine.tick_shared_action([primary,ally],world)
        self.assertEqual(primary['state']['hp'],before)
        self.assertIsNotNone(ally['state']['combat'].get('inspirado'))

    def test_heroic_rank_sync_is_announced_once_and_snapshot_exposes_it(self):
        state=m.new_state('humano','juramentado','home:test',self.now);state.update(level=20,gender='femenino',flags=['encargo_pagado:x','victoria:edran_prado:cornalomo'])
        self.engine.effects(state,{'flags':[]},{'set_specialization':'juramentado_heroico'})
        self.assertIn('rango:escudero',state['flags']);self.assertIn('rango:defensor:valdren',state['flags'])
        count=len(state['events']);self.engine.sync_ranks(state);self.assertEqual(len(state['events']),count)
        char={'id':1,'name':'Prueba','species':'humano','class_id':'juramentado','status':'approved','state':state}
        snap=self.engine.snapshot(char,{'flags':[],'deaths':{},'version':0})['character']
        self.assertEqual(snap['titulo'],'Defensora de Valdren')
        self.assertIn('especializacion',snap);self.assertGreaterEqual(len(snap['rangos']),2)

    def test_combat_actions_offer_top_echoes_and_disable_recent_flight(self):
        char=self.combatant(spec='arcano_ecos');state=char['state'];state['flags']=['victoria:a:mordelinde','victoria:b:tallagrietas','victoria:c:sierpe_veta_madre']
        world={'flags':[],'deaths':{}}
        acts=self.engine.actions(char,world)
        eco_actions=[a for a in acts if a['id']=='invocar_eco']
        self.assertEqual(len(eco_actions),3);self.assertEqual([a['target'] for a in eco_actions],['sierpe_veta_madre','tallagrietas','mordelinde'])
        self.engine.apply_action(char,world,{'id':'invocar_eco','target':'tallagrietas'})
        self.assertEqual(state['combat']['intervention']['eco']['power'],5)
        hero=self.combatant('juramentado',spec='juramentado_heroico');hero['state']['flags']=['rango:defensor'];self.engine.flee(hero,world)
        inspire=next(a for a in self.engine.actions(hero,world) if a['id']=='inspirar_valentia')
        self.assertTrue(inspire['disabled']);self.assertIn('Huiste hace poco',inspire['reason'])


class EspecializationBalanceSimulationTests(unittest.TestCase):
    """Regression against the approved 1,500-run Sierpe table (300 fixed-seed runs)."""
    def player(self, kind):
        cls='arcano' if kind.startswith('arc') else 'juramentado'
        state=m.new_state('humano',cls,'home',0);state['level']=20;pa=38
        priority=['intelecto','resistencia','destreza','voluntad'] if cls=='arcano' else ['fuerza','resistencia','destreza']
        index=0
        while True:
            attr=priority[index%len(priority)];value=state['attributes'][attr]
            cost=1 if value<20 else 2 if value<35 else 3 if value<45 else 4 if value<60 else 5
            if pa<cost:break
            pa-=cost;state['attributes'][attr]+=1;index+=1
        wid,damage=('baston_raiz',15) if cls=='arcano' else ('espada_vaisgard',18)
        state['inventory']=[{'id':wid,'kind':'weapon','damage':damage},{'id':'amu','kind':'accessory','bonus':{'vida':20}}]
        state['equipment']={'weapon':wid,'amuleto':'amu'};state['armor_reduction']=.42;state['hp']=m.hp_max(state);state['_class']=cls
        if kind=='arc_ecos':state['especializacion']={'id':'arcano_ecos'};state['_eco']=8
        if kind=='jur_heroe':state['especializacion']={'id':'juramentado_heroico'};state['flags'].append('rango:defensor')
        state['_kind']=kind;state['_pots']=0
        return state

    @staticmethod
    def choose(state,rng):
        combat=state['combat'];cooldowns=combat.get('cooldowns',{});prep=m.preparation(combat);kind=state['_kind'];cls=state['_class']
        if state['_pots']<3 and state['hp']<.38*m.hp_max(state):
            state['inventory'].append({'id':'pot','effect':'potion','heal':.45,'fatigue':0,'quantity':1,'name':'Poción'});state['_pots']+=1
            return {'id':'usar','target':'pot'}
        if kind=='jur_heroe' and not cooldowns.get('inspirar_valentia') and not combat.get('inspirado'):return {'id':'inspirar_valentia'}
        if kind=='arc_ecos' and not cooldowns.get('invocar_eco'):return {'id':'invocar_eco','eco':{'id':'e','name':'Cornalomo','power':8}}
        if kind=='arc_ecos' and prep and not prep.get('interruptible') and not cooldowns.get('velo_espectral'):return {'id':'velo_espectral'}
        signature=m.CLASSES[cls]['signature_id']
        if prep and prep.get('interruptible') and cls=='arcano' and not cooldowns.get(signature):return {'id':signature}
        if prep and prep.get('interruptible') and cls=='juramentado' and not cooldowns.get('paso_ruptura'):return {'id':'paso_ruptura'}
        if prep and cls=='juramentado' and prep.get('frontal') and not cooldowns.get(signature):return {'id':signature}
        if prep and cls=='arcano' and not cooldowns.get('velo_contencion'):return {'id':'velo_contencion'}
        if prep and not prep.get('interruptible') and not prep.get('frontal') and rng.random()<.3:return {'id':'esquivar'}
        return {'id':'atacar'}

    def win_rate(self,kind,runs=300):
        rng=random.Random(7);wins=0;profile=m.PROFILES['sierpe_veta_madre'];creature={'id':'sierpe_veta_madre','name':'Sierpe'}
        for _ in range(runs):
            state=self.player(kind);preps=profile.get('preparations');prepared=preps[0] if preps else profile.get('prepared_action')
            state['combat']={'creature':creature['id'],'profile':profile,'hp':profile['hp'],'round':0,'prepared':bool(prepared),'prepared_action':prepared,'cooldown':0}
            for _ in range(80):
                state['combat']['intervention']=self.choose(state,rng)
                _,outcome=m.resolve_round(state,creature,rng)
                state['fatigue']=min(state['fatigue'],60)
                if outcome=='victory':wins+=1;break
                if outcome=='death':break
        return 100*wins/runs

    def test_sierpe_success_rates_stay_within_five_points_of_design(self):
        expected={'arc':15,'arc_ecos':32,'jur':53,'jur_heroe':74}
        for kind,rate in expected.items():
            self.assertLessEqual(abs(self.win_rate(kind)-rate),5,kind)

if __name__=='__main__': unittest.main()
